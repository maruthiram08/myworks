"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface EnrollButtonProps {
  courseId: string
  pricingType: string
}

export function EnrollButton({ courseId, pricingType }: EnrollButtonProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleEnroll = async () => {
    if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=" + window.location.pathname)
      return
    }

    setIsLoading(true)

    try {
      if (pricingType === "FREE") {
        // Direct enrollment for free courses
        const response = await fetch("/api/enrollments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ courseId }),
        })

        if (response.ok) {
          router.push(`/learn/${courseId}`)
          router.refresh()
        } else {
          const error = await response.json()
          alert(error.error || "Failed to enroll")
        }
      } else {
        // Paid courses - redirect to Stripe checkout
        const response = await fetch("/api/stripe/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ courseId }),
        })

        if (response.ok) {
          const { url } = await response.json()
          window.location.href = url
        } else {
          const error = await response.json()
          alert(error.error || "Failed to create checkout session")
        }
      }
    } catch (error) {
      console.error("Enrollment error:", error)
      alert("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleEnroll}
      disabled={isLoading || status === "loading"}
      className="w-full py-6 text-lg"
      size="lg"
    >
      {isLoading ? (
        <>
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          Processing...
        </>
      ) : pricingType === "FREE" ? (
        "Enroll for Free"
      ) : (
        "Buy Now"
      )}
    </Button>
  )
}
