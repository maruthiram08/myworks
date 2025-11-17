import express from 'express';
import { PrismaClient, PaymentStatus } from '@prisma/client';
import Stripe from 'stripe';
import { body } from 'express-validator';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { AppError } from '../middleware/error.middleware';

const router = express.Router();
const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
});

// Create payment intent
router.post(
  '/create-intent',
  authenticate,
  validate([
    body('rideId').notEmpty(),
  ]),
  async (req: AuthRequest, res, next) => {
    try {
      const { rideId } = req.body;

      const ride = await prisma.ride.findUnique({
        where: { id: rideId },
      });

      if (!ride) {
        throw new AppError('Ride not found', 404);
      }

      if (ride.riderId !== req.user!.id) {
        throw new AppError('Unauthorized', 403);
      }

      // Create Stripe payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(ride.totalFare * 100), // Convert to cents
        currency: 'usd',
        metadata: {
          rideId: ride.id,
          riderId: ride.riderId,
        },
      });

      // Create payment record
      const payment = await prisma.payment.create({
        data: {
          rideId: ride.id,
          userId: req.user!.id,
          amount: ride.totalFare,
          paymentMethod: 'CARD',
          paymentStatus: PaymentStatus.PENDING,
          stripePaymentIntentId: paymentIntent.id,
        },
      });

      res.json({
        clientSecret: paymentIntent.client_secret,
        payment,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Confirm payment
router.post(
  '/confirm',
  authenticate,
  validate([
    body('paymentId').notEmpty(),
    body('paymentIntentId').notEmpty(),
  ]),
  async (req: AuthRequest, res, next) => {
    try {
      const { paymentId, paymentIntentId } = req.body;

      const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
      });

      if (!payment) {
        throw new AppError('Payment not found', 404);
      }

      if (payment.userId !== req.user!.id) {
        throw new AppError('Unauthorized', 403);
      }

      // Verify payment with Stripe
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      if (paymentIntent.status === 'succeeded') {
        await prisma.payment.update({
          where: { id: paymentId },
          data: {
            paymentStatus: PaymentStatus.COMPLETED,
            stripeChargeId: paymentIntent.latest_charge as string,
          },
        });

        res.json({
          message: 'Payment confirmed successfully',
          status: 'succeeded',
        });
      } else {
        await prisma.payment.update({
          where: { id: paymentId },
          data: {
            paymentStatus: PaymentStatus.FAILED,
          },
        });

        throw new AppError('Payment failed', 400);
      }
    } catch (error) {
      next(error);
    }
  }
);

// Stripe webhook
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res, next) => {
  const sig = req.headers['stripe-signature'] as string;

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await prisma.payment.updateMany({
          where: { stripePaymentIntentId: paymentIntent.id },
          data: {
            paymentStatus: PaymentStatus.COMPLETED,
            stripeChargeId: paymentIntent.latest_charge as string,
          },
        });
        break;
      }
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await prisma.payment.updateMany({
          where: { stripePaymentIntentId: paymentIntent.id },
          data: { paymentStatus: PaymentStatus.FAILED },
        });
        break;
      }
    }

    res.json({ received: true });
  } catch (error) {
    next(error);
  }
});

// Get payment methods
router.get('/methods', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const paymentMethods = await prisma.paymentMethodModel.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ paymentMethods });
  } catch (error) {
    next(error);
  }
});

// Add payment method
router.post(
  '/methods',
  authenticate,
  validate([
    body('paymentMethodId').notEmpty(),
  ]),
  async (req: AuthRequest, res, next) => {
    try {
      const { paymentMethodId } = req.body;

      // Retrieve payment method from Stripe
      const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);

      // Save to database
      const savedMethod = await prisma.paymentMethodModel.create({
        data: {
          userId: req.user!.id,
          stripePaymentMethodId: paymentMethodId,
          type: paymentMethod.type,
          last4: paymentMethod.card?.last4 || '',
          brand: paymentMethod.card?.brand,
          expiryMonth: paymentMethod.card?.exp_month,
          expiryYear: paymentMethod.card?.exp_year,
        },
      });

      res.json({
        message: 'Payment method added successfully',
        paymentMethod: savedMethod,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
