import express from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { body } from 'express-validator';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { AppError } from '../middleware/error.middleware';

const router = express.Router();
const prisma = new PrismaClient();

// Get user profile
router.get('/profile', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: {
        riderProfile: true,
        driverProfile: true,
      },
      // Exclude password
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const { password: _, ...userWithoutPassword } = user;

    res.json({ user: userWithoutPassword });
  } catch (error) {
    next(error);
  }
});

// Update user profile
router.put(
  '/profile',
  authenticate,
  validate([
    body('name').optional().notEmpty(),
    body('phone').optional().isMobilePhone('any'),
    body('avatar').optional().isURL(),
  ]),
  async (req: AuthRequest, res, next) => {
    try {
      const { name, phone, avatar } = req.body;

      const user = await prisma.user.update({
        where: { id: req.user!.id },
        data: {
          ...(name && { name }),
          ...(phone && { phone }),
          ...(avatar && { avatar }),
        },
      });

      const { password: _, ...userWithoutPassword } = user;

      res.json({
        message: 'Profile updated successfully',
        user: userWithoutPassword,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Update rider profile
router.put(
  '/rider-profile',
  authenticate,
  validate([
    body('homeAddress').optional().isString(),
    body('workAddress').optional().isString(),
  ]),
  async (req: AuthRequest, res, next) => {
    try {
      const { homeAddress, workAddress } = req.body;

      const riderProfile = await prisma.riderProfile.upsert({
        where: { userId: req.user!.id },
        update: {
          ...(homeAddress && { homeAddress }),
          ...(workAddress && { workAddress }),
        },
        create: {
          userId: req.user!.id,
          homeAddress,
          workAddress,
        },
      });

      res.json({
        message: 'Rider profile updated successfully',
        riderProfile,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Change password
router.put(
  '/change-password',
  authenticate,
  validate([
    body('currentPassword').notEmpty(),
    body('newPassword').isLength({ min: 6 }),
  ]),
  async (req: AuthRequest, res, next) => {
    try {
      const { currentPassword, newPassword } = req.body;

      const user = await prisma.user.findUnique({
        where: { id: req.user!.id },
      });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);

      if (!isValidPassword) {
        throw new AppError('Current password is incorrect', 401);
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await prisma.user.update({
        where: { id: req.user!.id },
        data: { password: hashedPassword },
      });

      res.json({
        message: 'Password changed successfully',
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
