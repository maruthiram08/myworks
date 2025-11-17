import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = headers().get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ message: 'Missing signature' }, { status: 400 })
  }

  let event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ message: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object
        const bookingId = paymentIntent.metadata.bookingId

        if (bookingId) {
          await prisma.booking.update({
            where: { id: bookingId },
            data: {
              status: 'CONFIRMED',
              stripePaymentId: paymentIntent.id,
            },
          })

          await prisma.payment.create({
            data: {
              bookingId,
              amount: paymentIntent.amount / 100,
              currency: paymentIntent.currency,
              status: 'SUCCEEDED',
              stripePaymentId: paymentIntent.id,
            },
          })
        }
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object
        const bookingId = paymentIntent.metadata.bookingId

        if (bookingId) {
          await prisma.payment.create({
            data: {
              bookingId,
              amount: paymentIntent.amount / 100,
              currency: paymentIntent.currency,
              status: 'FAILED',
              stripePaymentId: paymentIntent.id,
            },
          })
        }
        break
      }

      case 'charge.refunded': {
        const charge = event.data.object
        const paymentIntentId = charge.payment_intent as string

        if (paymentIntentId) {
          const booking = await prisma.booking.findFirst({
            where: { stripePaymentId: paymentIntentId },
          })

          if (booking) {
            await prisma.booking.update({
              where: { id: booking.id },
              data: {
                status: 'REFUNDED',
                stripeRefundId: charge.refund as string,
              },
            })

            await prisma.payment.updateMany({
              where: { bookingId: booking.id },
              data: { status: 'REFUNDED' },
            })
          }
        }
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Webhook handler error:', error)
    return NextResponse.json(
      { message: error.message || 'Webhook handler failed' },
      { status: 500 }
    )
  }
}
