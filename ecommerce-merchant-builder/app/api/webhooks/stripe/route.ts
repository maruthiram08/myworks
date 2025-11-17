import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { constructWebhookEvent } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = headers().get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'No signature' },
        { status: 400 }
      );
    }

    const event = await constructWebhookEvent(body, signature);

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any;
        const orderId = session.metadata.orderId;

        if (orderId) {
          await prisma.order.update({
            where: { id: orderId },
            data: {
              status: 'PAID',
              stripePaymentId: session.payment_intent,
            },
          });

          // Create webhook event
          await prisma.webhookEvent.create({
            data: {
              orderId,
              event: 'order.paid',
              payload: session,
            },
          });
        }
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as any;
        // Handle successful payment
        console.log('Payment succeeded:', paymentIntent.id);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as any;
        // Handle failed payment
        console.log('Payment failed:', paymentIntent.id);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 400 }
    );
  }
}
