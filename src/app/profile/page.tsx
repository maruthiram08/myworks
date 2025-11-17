import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ProfileForm } from '@/components/profile-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function ProfilePage() {
  const user = await requireAuth()

  const userDetails = await prisma.user.findUnique({
    where: { id: user.id },
  })

  if (!userDetails) {
    return <div>User not found</div>
  }

  return (
    <div className="container max-w-2xl py-8">
      <h1 className="mb-8 text-3xl font-bold">Profile Settings</h1>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your profile information</CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileForm user={userDetails} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Type</CardTitle>
            <CardDescription>Your current role and permissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Current Role:</span>
                <span className="text-sm rounded-full bg-primary/10 px-3 py-1">
                  {userDetails.role}
                </span>
              </div>
              {userDetails.role === 'GUEST' && (
                <p className="text-sm text-muted-foreground">
                  Want to become a host? Contact support to upgrade your account.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
