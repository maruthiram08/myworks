'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { PROPERTY_TYPES, PROPERTY_CATEGORIES, AMENITIES } from '@/lib/constants'

interface PropertyFormProps {
  property?: any
}

export function PropertyForm({ property }: PropertyFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: property?.title || '',
    description: property?.description || '',
    type: property?.type || 'ENTIRE_PLACE',
    category: property?.category || 'HOUSE',
    country: property?.country || '',
    state: property?.state || '',
    city: property?.city || '',
    address: property?.address || '',
    zipCode: property?.zipCode || '',
    latitude: property?.latitude || 0,
    longitude: property?.longitude || 0,
    guests: property?.guests || 1,
    bedrooms: property?.bedrooms || 1,
    beds: property?.beds || 1,
    bathrooms: property?.bathrooms || 1,
    amenities: property?.amenities || [],
    pricePerNight: property?.pricePerNight || '',
    cleaningFee: property?.cleaningFee || 0,
    minNights: property?.minNights || 1,
    maxNights: property?.maxNights || 365,
    instantBook: property?.instantBook || false,
    images: property?.images || [],
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = property ? `/api/properties/${property.id}` : '/api/properties'
      const method = property ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to save property')
      }

      const savedProperty = await response.json()

      toast({
        title: property ? 'Property updated' : 'Property created',
        description: property
          ? 'Your property has been updated successfully.'
          : 'Your property has been created successfully.',
      })

      router.push(`/properties/${savedProperty.id}`)
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const toggleAmenity = (amenityId: string) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenityId)
        ? prev.amenities.filter((a: string) => a !== amenityId)
        : [...prev.amenities, amenityId],
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Basic Information</h3>

        <div className="space-y-2">
          <Label htmlFor="title">Property Title *</Label>
          <Input
            id="title"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Beautiful beachfront villa"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description *</Label>
          <textarea
            id="description"
            required
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe your property..."
            rows={5}
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="type">Property Type *</Label>
            <select
              id="type"
              required
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {PROPERTY_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <select
              id="category"
              required
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {PROPERTY_CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.icon} {cat.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Location</h3>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="country">Country *</Label>
            <Input
              id="country"
              required
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              placeholder="United States"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="state">State/Province *</Label>
            <Input
              id="state"
              required
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              placeholder="California"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">City *</Label>
            <Input
              id="city"
              required
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="Los Angeles"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="zipCode">Zip Code *</Label>
            <Input
              id="zipCode"
              required
              value={formData.zipCode}
              onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
              placeholder="90001"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Street Address *</Label>
          <Input
            id="address"
            required
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="123 Main Street"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="latitude">Latitude</Label>
            <Input
              id="latitude"
              type="number"
              step="any"
              value={formData.latitude}
              onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
              placeholder="34.0522"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="longitude">Longitude</Label>
            <Input
              id="longitude"
              type="number"
              step="any"
              value={formData.longitude}
              onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
              placeholder="-118.2437"
            />
          </div>
        </div>
      </div>

      {/* Property Details */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Property Details</h3>

        <div className="grid gap-4 md:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="guests">Max Guests *</Label>
            <Input
              id="guests"
              type="number"
              min="1"
              required
              value={formData.guests}
              onChange={(e) => setFormData({ ...formData, guests: parseInt(e.target.value) })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bedrooms">Bedrooms *</Label>
            <Input
              id="bedrooms"
              type="number"
              min="0"
              required
              value={formData.bedrooms}
              onChange={(e) => setFormData({ ...formData, bedrooms: parseInt(e.target.value) })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="beds">Beds *</Label>
            <Input
              id="beds"
              type="number"
              min="0"
              required
              value={formData.beds}
              onChange={(e) => setFormData({ ...formData, beds: parseInt(e.target.value) })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bathrooms">Bathrooms *</Label>
            <Input
              id="bathrooms"
              type="number"
              min="0"
              step="0.5"
              required
              value={formData.bathrooms}
              onChange={(e) => setFormData({ ...formData, bathrooms: parseFloat(e.target.value) })}
            />
          </div>
        </div>
      </div>

      {/* Amenities */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Amenities</h3>
        <div className="grid gap-3 md:grid-cols-3">
          {AMENITIES.map((amenity) => (
            <label
              key={amenity.id}
              className="flex items-center space-x-2 rounded-lg border p-3 cursor-pointer hover:bg-accent"
            >
              <input
                type="checkbox"
                checked={formData.amenities.includes(amenity.id)}
                onChange={() => toggleAmenity(amenity.id)}
                className="h-4 w-4"
              />
              <span className="text-lg">{amenity.icon}</span>
              <span className="text-sm">{amenity.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Pricing */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Pricing</h3>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="pricePerNight">Price per Night * ($)</Label>
            <Input
              id="pricePerNight"
              type="number"
              min="0"
              step="0.01"
              required
              value={formData.pricePerNight}
              onChange={(e) => setFormData({ ...formData, pricePerNight: e.target.value })}
              placeholder="100.00"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cleaningFee">Cleaning Fee ($)</Label>
            <Input
              id="cleaningFee"
              type="number"
              min="0"
              step="0.01"
              value={formData.cleaningFee}
              onChange={(e) => setFormData({ ...formData, cleaningFee: parseFloat(e.target.value) })}
              placeholder="50.00"
            />
          </div>
        </div>
      </div>

      {/* Booking Rules */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Booking Rules</h3>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="minNights">Minimum Nights *</Label>
            <Input
              id="minNights"
              type="number"
              min="1"
              required
              value={formData.minNights}
              onChange={(e) => setFormData({ ...formData, minNights: parseInt(e.target.value) })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxNights">Maximum Nights *</Label>
            <Input
              id="maxNights"
              type="number"
              min="1"
              required
              value={formData.maxNights}
              onChange={(e) => setFormData({ ...formData, maxNights: parseInt(e.target.value) })}
            />
          </div>
        </div>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={formData.instantBook}
            onChange={(e) => setFormData({ ...formData, instantBook: e.target.checked })}
            className="h-4 w-4"
          />
          <span className="text-sm">Allow instant booking (guests can book without approval)</span>
        </label>
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={loading} size="lg">
          {loading ? 'Saving...' : property ? 'Update Property' : 'Create Property'}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
