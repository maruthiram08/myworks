import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get("stripe-signature")!

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error("Webhook signature verification failed:", err)
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      )
    }

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        const { courseId, userId, pricingType } = session.metadata!

        // Update payment record
        await prisma.payment.updateMany({
          where: {
            stripeSessionId: session.id,
          },
          data: {
            status: "COMPLETED",
            stripePaymentId: session.payment_intent as string,
          },
        })

        // Create enrollment
        await prisma.enrollment.create({
          data: {
            userId,
            courseId,
          },
        })

        // Update course enrollment count
        await prisma.course.update({
          where: { id: courseId },
          data: {
            enrollmentCount: {
              increment: 1,
            },
          },
        })

        break
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent

        await prisma.payment.updateMany({
          where: {
            stripePaymentId: paymentIntent.id,
          },
          data: {
            status: "FAILED",
          },
        })

        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription
        // Handle subscription cancellation
        // You might want to revoke access or mark enrollment as expired
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Error processing webhook:", error)
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    )
  }
}
