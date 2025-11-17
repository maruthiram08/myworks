import { Metadata } from "next"
import { SignInForm } from "@/components/auth/signin-form"

export const metadata: Metadata = {
  title: "Sign In - CourseHub",
  description: "Sign in to your CourseHub account",
}

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Sign in to CourseHub</h2>
          <p className="mt-2 text-gray-600">
            Continue your learning journey
          </p>
        </div>
        <SignInForm />
      </div>
    </div>
  )
}
