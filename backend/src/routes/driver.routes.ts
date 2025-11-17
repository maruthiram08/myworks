import express from 'express';
import { PrismaClient, RideStatus } from '@prisma/client';
import { body } from 'express-validator';
import { authenticate, authorize, AuthRequest } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { AppError } from '../middleware/error.middleware';
import { notifyRider } from '../websocket';

const router = express.Router();
const prisma = new PrismaClient();

// Update driver profile (complete registration)
router.put(
  '/profile',
  authenticate,
  authorize('DRIVER'),
  validate([
    body('licenseNumber').notEmpty(),
    body('licenseExpiry').isISO8601(),
    body('vehicleType').isIn(['ECONOMY', 'COMFORT', 'PREMIUM', 'XL']),
    body('vehicleMake').notEmpty(),
    body('vehicleModel').notEmpty(),
    body('vehicleYear').isInt({ min: 1990, max: new Date().getFullYear() + 1 }),
    body('vehicleColor').notEmpty(),
    body('vehiclePlate').notEmpty(),
  ]),
  async (req: AuthRequest, res, next) => {
    try {
      const {
        licenseNumber,
        licenseExpiry,
        vehicleType,
        vehicleMake,
        vehicleModel,
        vehicleYear,
        vehicleColor,
        vehiclePlate,
      } = req.body;

      const driverProfile = await prisma.driverProfile.upsert({
        where: { userId: req.user!.id },
        update: {
          licenseNumber,
          licenseExpiry: new Date(licenseExpiry),
          vehicleType,
          vehicleMake,
          vehicleModel,
          vehicleYear,
          vehicleColor,
          vehiclePlate,
        },
        create: {
          userId: req.user!.id,
          licenseNumber,
          licenseExpiry: new Date(licenseExpiry),
          vehicleType,
          vehicleMake,
          vehicleModel,
          vehicleYear,
          vehicleColor,
          vehiclePlate,
        },
      });

      res.json({
        message: 'Driver profile updated successfully',
        driverProfile,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Update availability status
router.put(
  '/availability',
  authenticate,
  authorize('DRIVER'),
  validate([body('isAvailable').isBoolean()]),
  async (req: AuthRequest, res, next) => {
    try {
      const { isAvailable } = req.body;

      const driverProfile = await prisma.driverProfile.update({
        where: { userId: req.user!.id },
        data: { isAvailable },
      });

      res.json({
        message: `Driver is now ${isAvailable ? 'available' : 'unavailable'}`,
        driverProfile,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Update location
router.post(
  '/location',
  authenticate,
  authorize('DRIVER'),
  validate([
    body('latitude').isFloat(),
    body('longitude').isFloat(),
  ]),
  async (req: AuthRequest, res, next) => {
    try {
      const { latitude, longitude } = req.body;

      const driverProfile = await prisma.driverProfile.update({
        where: { userId: req.user!.id },
        data: {
          currentLatitude: latitude,
          currentLongitude: longitude,
          lastLocationUpdate: new Date(),
        },
      });

      // If driver has an active ride, update tracking
      const activeRide = await prisma.ride.findFirst({
        where: {
          driverId: req.user!.id,
          status: {
            in: [RideStatus.ACCEPTED, RideStatus.DRIVER_ARRIVED, RideStatus.IN_PROGRESS],
          },
        },
      });

      if (activeRide) {
        await prisma.rideTracking.create({
          data: {
            rideId: activeRide.id,
            latitude,
            longitude,
          },
        });

        // Notify rider of driver location
        notifyRider(activeRide.riderId, 'driver_location_update', {
          rideId: activeRide.id,
          latitude,
          longitude,
        });
      }

      res.json({ message: 'Location updated successfully' });
    } catch (error) {
      next(error);
    }
  }
);

// Accept ride
router.post(
  '/rides/:rideId/accept',
  authenticate,
  authorize('DRIVER'),
  async (req: AuthRequest, res, next) => {
    try {
      const { rideId } = req.params;

      const ride = await prisma.ride.findUnique({
        where: { id: rideId },
      });

      if (!ride) {
        throw new AppError('Ride not found', 404);
      }

      if (ride.status !== RideStatus.REQUESTED) {
        throw new AppError('Ride is no longer available', 400);
      }

      // Check if driver is verified
      const driverProfile = await prisma.driverProfile.findUnique({
        where: { userId: req.user!.id },
      });

      if (!driverProfile?.isVerified) {
        throw new AppError('Driver profile not verified', 403);
      }

      if (!driverProfile.isAvailable) {
        throw new AppError('Driver is not available', 400);
      }

      // Update ride
      const updatedRide = await prisma.ride.update({
        where: { id: rideId },
        data: {
          driverId: req.user!.id,
          status: RideStatus.ACCEPTED,
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

      // Update driver availability
      await prisma.driverProfile.update({
        where: { userId: req.user!.id },
        data: { isAvailable: false },
      });

      // Notify rider
      notifyRider(ride.riderId, 'ride_accepted', {
        rideId,
        driver: {
          id: req.user!.id,
          name: req.user!.email,
          vehicle: {
            make: driverProfile.vehicleMake,
            model: driverProfile.vehicleModel,
            color: driverProfile.vehicleColor,
            plate: driverProfile.vehiclePlate,
          },
        },
      });

      res.json({
        message: 'Ride accepted successfully',
        ride: updatedRide,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Update ride status
router.put(
  '/rides/:rideId/status',
  authenticate,
  authorize('DRIVER'),
  validate([
    body('status').isIn(['DRIVER_ARRIVED', 'IN_PROGRESS', 'COMPLETED']),
  ]),
  async (req: AuthRequest, res, next) => {
    try {
      const { rideId } = req.params;
      const { status } = req.body;

      const ride = await prisma.ride.findUnique({
        where: { id: rideId },
      });

      if (!ride) {
        throw new AppError('Ride not found', 404);
      }

      if (ride.driverId !== req.user!.id) {
        throw new AppError('Unauthorized', 403);
      }

      const updateData: any = { status };

      if (status === RideStatus.IN_PROGRESS) {
        updateData.startTime = new Date();
      } else if (status === RideStatus.COMPLETED) {
        updateData.endTime = new Date();

        if (ride.startTime) {
          const duration = Math.ceil(
            (new Date().getTime() - ride.startTime.getTime()) / 1000 / 60
          );
          updateData.actualDuration = duration;
        }
      }

      const updatedRide = await prisma.ride.update({
        where: { id: rideId },
        data: updateData,
      });

      // If completed, make driver available again
      if (status === RideStatus.COMPLETED) {
        await prisma.driverProfile.update({
          where: { userId: req.user!.id },
          data: { isAvailable: true },
        });
      }

      // Notify rider
      notifyRider(ride.riderId, 'ride_status_update', {
        rideId,
        status,
      });

      res.json({
        message: 'Ride status updated successfully',
        ride: updatedRide,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get driver earnings
router.get(
  '/earnings',
  authenticate,
  authorize('DRIVER'),
  async (req: AuthRequest, res, next) => {
    try {
      const { startDate, endDate } = req.query;

      const where: any = {
        driverId: req.user!.id,
        status: RideStatus.COMPLETED,
      };

      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = new Date(startDate as string);
        if (endDate) where.createdAt.lte = new Date(endDate as string);
      }

      const rides = await prisma.ride.findMany({
        where,
        select: {
          totalFare: true,
          createdAt: true,
        },
      });

      const totalEarnings = rides.reduce((sum, ride) => sum + ride.totalFare, 0);
      const driverEarnings = totalEarnings * 0.8; // 80% to driver, 20% platform fee

      res.json({
        totalRides: rides.length,
        grossEarnings: totalEarnings,
        netEarnings: driverEarnings,
        rides,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
