import { requireHost } from '@/lib/auth'
import { PropertyForm } from '@/components/property-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function NewPropertyPage() {
  await requireHost()

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">List Your Property</h1>
        <p className="text-muted-foreground">
          Share your space with travelers from around the world
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Property Details</CardTitle>
          <CardDescription>
            Tell us about your property. You can always edit this information later.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PropertyForm />
        </CardContent>
      </Card>
    </div>
  )
}
