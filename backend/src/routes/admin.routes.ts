import express from 'express';
import { PrismaClient } from '@prisma/client';
import { body } from 'express-validator';
import { authenticate, authorize, AuthRequest } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { AppError } from '../middleware/error.middleware';

const router = express.Router();
const prisma = new PrismaClient();

// All routes require admin authentication
router.use(authenticate);
router.use(authorize('ADMIN'));

// Get dashboard statistics
router.get('/stats', async (req: AuthRequest, res, next) => {
  try {
    const [
      totalRiders,
      totalDrivers,
      totalRides,
      activeRides,
      completedRides,
      totalRevenue,
      availableDrivers,
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'RIDER' } }),
      prisma.user.count({ where: { role: 'DRIVER' } }),
      prisma.ride.count(),
      prisma.ride.count({
        where: {
          status: {
            in: ['REQUESTED', 'ACCEPTED', 'DRIVER_ARRIVED', 'IN_PROGRESS'],
          },
        },
      }),
      prisma.ride.count({ where: { status: 'COMPLETED' } }),
      prisma.payment.aggregate({
        where: { paymentStatus: 'COMPLETED' },
        _sum: { amount: true },
      }),
      prisma.driverProfile.count({
        where: {
          isAvailable: true,
          isVerified: true,
        },
      }),
    ]);

    res.json({
      totalRiders,
      totalDrivers,
      totalRides,
      activeRides,
      completedRides,
      totalRevenue: totalRevenue._sum.amount || 0,
      availableDrivers,
    });
  } catch (error) {
    next(error);
  }
});

// Get all rides
router.get('/rides', async (req: AuthRequest, res, next) => {
  try {
    const { status, limit = '20', offset = '0' } = req.query;

    const where: any = {};
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
            email: true,
            phone: true,
          },
        },
        driver: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            driverProfile: {
              select: {
                vehicleMake: true,
                vehicleModel: true,
                vehiclePlate: true,
              },
            },
          },
        },
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
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

// Get all drivers
router.get('/drivers', async (req: AuthRequest, res, next) => {
  try {
    const { isVerified, isAvailable, limit = '20', offset = '0' } = req.query;

    const where: any = { role: 'DRIVER' };

    const drivers = await prisma.user.findMany({
      where,
      include: {
        driverProfile: true,
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
    });

    // Filter by driver profile conditions
    let filteredDrivers = drivers;
    if (isVerified !== undefined) {
      filteredDrivers = filteredDrivers.filter(
        (d) => d.driverProfile?.isVerified === (isVerified === 'true')
      );
    }
    if (isAvailable !== undefined) {
      filteredDrivers = filteredDrivers.filter(
        (d) => d.driverProfile?.isAvailable === (isAvailable === 'true')
      );
    }

    const total = await prisma.user.count({ where });

    res.json({
      drivers: filteredDrivers,
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

// Verify driver
router.put(
  '/drivers/:driverId/verify',
  validate([body('isVerified').isBoolean()]),
  async (req: AuthRequest, res, next) => {
    try {
      const { driverId } = req.params;
      const { isVerified } = req.body;

      const driver = await prisma.user.findUnique({
        where: { id: driverId },
        include: { driverProfile: true },
      });

      if (!driver || driver.role !== 'DRIVER') {
        throw new AppError('Driver not found', 404);
      }

      if (!driver.driverProfile) {
        throw new AppError('Driver profile not found', 404);
      }

      const updatedProfile = await prisma.driverProfile.update({
        where: { userId: driverId },
        data: { isVerified },
      });

      res.json({
        message: `Driver ${isVerified ? 'verified' : 'unverified'} successfully`,
        driverProfile: updatedProfile,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Deactivate user
router.put(
  '/users/:userId/deactivate',
  validate([body('isActive').isBoolean()]),
  async (req: AuthRequest, res, next) => {
    try {
      const { userId } = req.params;
      const { isActive } = req.body;

      const user = await prisma.user.update({
        where: { id: userId },
        data: { isActive },
      });

      res.json({
        message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
        user,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Update system settings
router.put(
  '/settings/:key',
  validate([body('value').notEmpty()]),
  async (req: AuthRequest, res, next) => {
    try {
      const { key } = req.params;
      const { value, description } = req.body;

      const setting = await prisma.systemSettings.upsert({
        where: { key },
        update: { value, description },
        create: { key, value, description },
      });

      res.json({
        message: 'Setting updated successfully',
        setting,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get system settings
router.get('/settings', async (req: AuthRequest, res, next) => {
  try {
    const settings = await prisma.systemSettings.findMany();
    res.json({ settings });
  } catch (error) {
    next(error);
  }
});

// Create surge area
router.post(
  '/surge-areas',
  validate([
    body('name').notEmpty(),
    body('coordinates').isArray(),
    body('surgeMultiplier').isFloat({ min: 1.0 }),
  ]),
  async (req: AuthRequest, res, next) => {
    try {
      const { name, coordinates, surgeMultiplier, startTime, endTime } = req.body;

      const surgeArea = await prisma.surgeArea.create({
        data: {
          name,
          coordinates,
          surgeMultiplier,
          startTime: startTime ? new Date(startTime) : null,
          endTime: endTime ? new Date(endTime) : null,
          isActive: true,
        },
      });

      res.status(201).json({
        message: 'Surge area created successfully',
        surgeArea,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get surge areas
router.get('/surge-areas', async (req: AuthRequest, res, next) => {
  try {
    const surgeAreas = await prisma.surgeArea.findMany({
      orderBy: { createdAt: 'desc' },
    });

    res.json({ surgeAreas });
  } catch (error) {
    next(error);
  }
});

export default router;
