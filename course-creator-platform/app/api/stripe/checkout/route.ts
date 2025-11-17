import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { courseId, priceId } = await request.json()

    if (!courseId) {
      return NextResponse.json(
        { error: "Course ID is required" },
        { status: 400 }
      )
    }

    // Get course details
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        instructor: true,
      },
    })

    if (!course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      )
    }

    // Check if already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId,
        },
      },
    })

    if (existingEnrollment) {
      return NextResponse.json(
        { error: "Already enrolled in this course" },
        { status: 400 }
      )
    }

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: course.pricingType === "SUBSCRIPTION" ? "subscription" : "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: course.title,
              description: course.shortDescription || undefined,
              images: course.thumbnail ? [course.thumbnail] : undefined,
            },
            unit_amount: Math.round(
              (course.pricingType === "SUBSCRIPTION"
                ? course.subscriptionPrice || 0
                : course.price) * 100
            ),
            ...(course.pricingType === "SUBSCRIPTION" && {
              recurring: {
                interval: "month",
              },
            }),
          },
          quantity: 1,
        },
      ],
      metadata: {
        courseId,
        userId: session.user.id,
        pricingType: course.pricingType,
      },
      success_url: `${process.env.NEXTAUTH_URL}/courses/${course.slug}?success=true`,
      cancel_url: `${process.env.NEXTAUTH_URL}/courses/${course.slug}?canceled=true`,
      customer_email: session.user.email || undefined,
    })

    // Create payment record
    await prisma.payment.create({
      data: {
        amount: course.pricingType === "SUBSCRIPTION"
          ? course.subscriptionPrice || 0
          : course.price,
        currency: "usd",
        status: "PENDING",
        type: course.pricingType === "SUBSCRIPTION" ? "SUBSCRIPTION" : "ONE_TIME",
        stripeSessionId: checkoutSession.id,
        userId: session.user.id,
        courseId,
      },
    })

    return NextResponse.json({
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
    })
  } catch (error) {
    console.error("Error creating checkout session:", error)
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    )
  }
}
