import express from 'express';
import { PrismaClient, RideStatus } from '@prisma/client';
import { body } from 'express-validator';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { AppError } from '../middleware/error.middleware';
import { calculateDistance, estimateDuration } from '../utils/distance';
import { calculateFare, getSurgeMultiplier } from '../utils/fare';
import { notifyDriver, notifyRider } from '../websocket';

const router = express.Router();
const prisma = new PrismaClient();

// Request a ride
router.post(
  '/request',
  authenticate,
  validate([
    body('pickupLatitude').isFloat(),
    body('pickupLongitude').isFloat(),
    body('pickupAddress').notEmpty(),
    body('dropoffLatitude').isFloat(),
    body('dropoffLongitude').isFloat(),
    body('dropoffAddress').notEmpty(),
    body('vehicleType').isIn(['ECONOMY', 'COMFORT', 'PREMIUM', 'XL']),
  ]),
  async (req: AuthRequest, res, next) => {
    try {
      const {
        pickupLatitude,
        pickupLongitude,
        pickupAddress,
        dropoffLatitude,
        dropoffLongitude,
        dropoffAddress,
        vehicleType,
      } = req.body;

      // Calculate distance and duration
      const distance = calculateDistance(
        pickupLatitude,
        pickupLongitude,
        dropoffLatitude,
        dropoffLongitude
      );
      const duration = estimateDuration(distance);

      // Get surge multiplier
      const surgeMultiplier = await getSurgeMultiplier(pickupLatitude, pickupLongitude);

      // Calculate fare
      const fareDetails = await calculateFare(distance, duration, vehicleType, surgeMultiplier);

      // Create ride
      const ride = await prisma.ride.create({
        data: {
          riderId: req.user!.id,
          pickupLatitude,
          pickupLongitude,
          pickupAddress,
          dropoffLatitude,
          dropoffLongitude,
          dropoffAddress,
          vehicleType,
          estimatedDistance: fareDetails.estimatedDistance,
          estimatedDuration: fareDetails.estimatedDuration,
          baseFare: fareDetails.baseFare,
          distanceFare: fareDetails.distanceFare,
          timeFare: fareDetails.timeFare,
          surgeFare: fareDetails.surgeFare,
          totalFare: fareDetails.totalFare,
        },
        include: {
          rider: {
            select: {
              id: true,
              name: true,
              phone: true,
              avatar: true,
            },
          },
        },
      });

      // Find nearby available drivers
      const nearbyDrivers = await prisma.user.findMany({
        where: {
          role: 'DRIVER',
          isActive: true,
          driverProfile: {
            isAvailable: true,
            isVerified: true,
            vehicleType,
          },
        },
        include: {
          driverProfile: true,
        },
      });

      // Notify nearby drivers
      for (const driver of nearbyDrivers) {
        if (driver.driverProfile?.currentLatitude && driver.driverProfile?.currentLongitude) {
          const distanceToDriver = calculateDistance(
            pickupLatitude,
            pickupLongitude,
            driver.driverProfile.currentLatitude,
            driver.driverProfile.currentLongitude
          );

          if (distanceToDriver <= 10) {
            // Within 10km
            notifyDriver(driver.id, 'new_ride_request', {
              rideId: ride.id,
              pickup: { latitude: pickupLatitude, longitude: pickupLongitude, address: pickupAddress },
              fare: fareDetails.totalFare,
              distance: distanceToDriver,
            });
          }
        }
      }

      res.status(201).json({
        message: 'Ride requested successfully',
        ride,
        fareDetails,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get ride details
router.get('/:rideId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { rideId } = req.params;

    const ride = await prisma.ride.findUnique({
      where: { id: rideId },
      include: {
        rider: {
          select: {
            id: true,
            name: true,
            phone: true,
            avatar: true,
          },
        },
        driver: {
          select: {
            id: true,
            name: true,
            phone: true,
            avatar: true,
            driverProfile: true,
          },
        },
        payment: true,
        rating: true,
      },
    });

    if (!ride) {
      throw new AppError('Ride not found', 404);
    }

    // Check authorization
    if (ride.riderId !== req.user!.id && ride.driverId !== req.user!.id && req.user!.role !== 'ADMIN') {
      throw new AppError('Unauthorized', 403);
    }

    res.json({ ride });
  } catch (error) {
    next(error);
  }
});

// Get user's rides
router.get('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { status, limit = '10', offset = '0' } = req.query;

    const where: any = {};

    if (req.user!.role === 'RIDER') {
      where.riderId = req.user!.id;
    } else if (req.user!.role === 'DRIVER') {
      where.driverId = req.user!.id;
    }

    if (status) {
      where.status = status;
    }

    const rides = await prisma.ride.findMany({
      where,
      include: {
        rider: {
          select: {
            id: true,
            name: true,
            phone: true,
            avatar: true,
          },
        },
        driver: {
          select: {
            id: true,
            name: true,
            avatar: true,
            driverProfile: {
              select: {
                vehicleMake: true,
                vehicleModel: true,
                vehicleColor: true,
                vehiclePlate: true,
              },
            },
          },
        },
        rating: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
    });

    const total = await prisma.ride.count({ where });

    res.json({
      rides,
      pagination: {
        total,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      },
    });
  } catch (error) {
    next(error);
  }
});

// Cancel ride
router.post('/:rideId/cancel', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { rideId } = req.params;
    const { reason } = req.body;

    const ride = await prisma.ride.findUnique({
      where: { id: rideId },
    });

    if (!ride) {
      throw new AppError('Ride not found', 404);
    }

    // Check authorization
    if (ride.riderId !== req.user!.id && ride.driverId !== req.user!.id) {
      throw new AppError('Unauthorized', 403);
    }

    // Check if ride can be cancelled
    if ([RideStatus.COMPLETED, RideStatus.CANCELLED].includes(ride.status)) {
      throw new AppError('Ride cannot be cancelled', 400);
    }

    const updatedRide = await prisma.ride.update({
      where: { id: rideId },
      data: {
        status: RideStatus.CANCELLED,
        cancelledBy: req.user!.id,
        cancelledAt: new Date(),
        cancellationReason: reason,
      },
    });

    // Notify the other party
    if (ride.riderId === req.user!.id && ride.driverId) {
      notifyDriver(ride.driverId, 'ride_cancelled', { rideId, reason });
    } else if (ride.driverId === req.user!.id) {
      notifyRider(ride.riderId, 'ride_cancelled', { rideId, reason });
    }

    res.json({
      message: 'Ride cancelled successfully',
      ride: updatedRide,
    });
  } catch (error) {
    next(error);
  }
});

// Get real-time tracking
router.get('/:rideId/tracking', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { rideId } = req.params;

    const ride = await prisma.ride.findUnique({
      where: { id: rideId },
    });

    if (!ride) {
      throw new AppError('Ride not found', 404);
    }

    // Check authorization
    if (ride.riderId !== req.user!.id && ride.driverId !== req.user!.id && req.user!.role !== 'ADMIN') {
      throw new AppError('Unauthorized', 403);
    }

    const tracking = await prisma.rideTracking.findMany({
      where: { rideId },
      orderBy: { timestamp: 'desc' },
      take: 50,
    });

    res.json({ tracking });
  } catch (error) {
    next(error);
  }
});

export default router;
