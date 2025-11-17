import express from 'express';
import { PrismaClient } from '@prisma/client';
import { body } from 'express-validator';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { AppError } from '../middleware/error.middleware';

const router = express.Router();
const prisma = new PrismaClient();

// Create rating
router.post(
  '/',
  authenticate,
  validate([
    body('rideId').notEmpty(),
    body('driverRating').isInt({ min: 1, max: 5 }),
    body('driverComment').optional().isString(),
  ]),
  async (req: AuthRequest, res, next) => {
    try {
      const { rideId, driverRating, driverComment } = req.body;

      const ride = await prisma.ride.findUnique({
        where: { id: rideId },
        include: { rating: true },
      });

      if (!ride) {
        throw new AppError('Ride not found', 404);
      }

      if (ride.riderId !== req.user!.id) {
        throw new AppError('Unauthorized', 403);
      }

      if (ride.status !== 'COMPLETED') {
        throw new AppError('Can only rate completed rides', 400);
      }

      if (ride.rating) {
        throw new AppError('Ride already rated', 400);
      }

      if (!ride.driverId) {
        throw new AppError('No driver assigned to this ride', 400);
      }

      // Create rating
      const rating = await prisma.rating.create({
        data: {
          rideId,
          riderId: req.user!.id,
          driverId: ride.driverId,
          driverRating,
          driverComment,
        },
      });

      // Update driver's average rating
      const driverRatings = await prisma.rating.findMany({
        where: { driverId: ride.driverId },
        select: { driverRating: true },
      });

      const averageRating =
        driverRatings.reduce((sum, r) => sum + r.driverRating, 0) / driverRatings.length;

      await prisma.driverProfile.update({
        where: { userId: ride.driverId },
        data: {
          averageRating: Math.round(averageRating * 10) / 10,
        },
      });

      // Update rider total rides
      await prisma.riderProfile.update({
        where: { userId: req.user!.id },
        data: {
          totalRides: { increment: 1 },
        },
      });

      res.status(201).json({
        message: 'Rating submitted successfully',
        rating,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get ratings for a driver
router.get('/driver/:driverId', async (req, res, next) => {
  try {
    const { driverId } = req.params;
    const { limit = '10', offset = '0' } = req.query;

    const ratings = await prisma.rating.findMany({
      where: { driverId },
      include: {
        rider: {
          select: {
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
    });

    const total = await prisma.rating.count({ where: { driverId } });

    res.json({
      ratings,
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

export default router;
