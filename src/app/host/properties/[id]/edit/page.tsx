import { notFound, redirect } from 'next/navigation'
import { requireHost } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PropertyForm } from '@/components/property-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default async function EditPropertyPage({ params }: { params: { id: string } }) {
  const user = await requireHost()

  const property = await prisma.property.findUnique({
    where: { id: params.id },
  })

  if (!property) {
    notFound()
  }

  if (property.hostId !== user.id && user.role !== 'ADMIN') {
    redirect('/host/dashboard')
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-6">
        <Link href="/host/dashboard" className="text-sm text-primary hover:underline">
          ← Back to dashboard
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold">Edit Property</h1>
        <p className="text-muted-foreground">Update your property details</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Property Details</CardTitle>
          <CardDescription>Make changes to your property listing</CardDescription>
        </CardHeader>
        <CardContent>
          <PropertyForm property={property} />
        </CardContent>
      </Card>
    </div>
  )
}
