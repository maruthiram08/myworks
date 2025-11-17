import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { body } from 'express-validator';
import { validate } from '../middleware/validation.middleware';
import { AppError } from '../middleware/error.middleware';

const router = express.Router();
const prisma = new PrismaClient();

// Register
router.post(
  '/register',
  validate([
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('name').notEmpty().trim(),
    body('role').isIn(['RIDER', 'DRIVER']),
    body('phone').optional().isMobilePhone('any'),
  ]),
  async (req, res, next) => {
    try {
      const { email, password, name, role, phone } = req.body;

      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new AppError('User already exists', 400);
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role,
          phone,
          ...(role === 'RIDER' && {
            riderProfile: {
              create: {},
            },
          }),
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        },
      });

      // Generate token
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );

      res.status(201).json({
        message: 'User created successfully',
        user,
        token,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Login
router.post(
  '/login',
  validate([
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ]),
  async (req, res, next) => {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          riderProfile: true,
          driverProfile: true,
        },
      });

      if (!user) {
        throw new AppError('Invalid credentials', 401);
      }

      if (!user.isActive) {
        throw new AppError('Account is deactivated', 403);
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        throw new AppError('Invalid credentials', 401);
      }

      // Generate token
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      res.json({
        message: 'Login successful',
        user: userWithoutPassword,
        token,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Verify token
router.get('/verify', async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No token provided', 401);
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key'
    ) as { id: string };

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        isActive: true,
        riderProfile: true,
        driverProfile: true,
      },
    });

    if (!user || !user.isActive) {
      throw new AppError('Invalid token', 401);
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
});

export default router;
