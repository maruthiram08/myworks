import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding...')

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@vacation-rental.com' },
    update: {},
    create: {
      email: 'admin@vacation-rental.com',
      name: 'Admin User',
      role: 'ADMIN',
      emailVerified: new Date(),
    },
  })

  // Create host user
  const hostUser = await prisma.user.upsert({
    where: { email: 'host@vacation-rental.com' },
    update: {},
    create: {
      email: 'host@vacation-rental.com',
      name: 'John Host',
      role: 'HOST',
      emailVerified: new Date(),
      bio: 'Experienced host with 5+ years of hosting guests from around the world.',
    },
  })

  // Create guest user
  const guestUser = await prisma.user.upsert({
    where: { email: 'guest@vacation-rental.com' },
    update: {},
    create: {
      email: 'guest@vacation-rental.com',
      name: 'Jane Guest',
      role: 'GUEST',
      emailVerified: new Date(),
    },
  })

  // Create sample properties
  const property1 = await prisma.property.create({
    data: {
      title: 'Luxury Beachfront Villa',
      description:
        'Wake up to stunning ocean views in this luxurious beachfront villa. Features modern amenities, private pool, and direct beach access. Perfect for families or groups looking for an unforgettable vacation experience.',
      type: 'ENTIRE_PLACE',
      category: 'VILLA',
      status: 'ACTIVE',
      hostId: hostUser.id,
      country: 'United States',
      state: 'California',
      city: 'Malibu',
      address: '123 Pacific Coast Highway',
      zipCode: '90265',
      latitude: 34.0259,
      longitude: -118.7798,
      guests: 8,
      bedrooms: 4,
      beds: 5,
      bathrooms: 3.5,
      amenities: [
        'WiFi',
        'Pool',
        'Beach Access',
        'Kitchen',
        'Air Conditioning',
        'Free Parking',
        'Ocean View',
        'BBQ Grill',
      ],
      pricePerNight: 450,
      cleaningFee: 150,
      images: [
        'https://images.unsplash.com/photo-1613490493576-7fde63acd811',
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750',
        'https://images.unsplash.com/photo-1613977257363-707ba9348227',
      ],
      instantBook: true,
      minNights: 2,
      maxNights: 30,
    },
  })

  const property2 = await prisma.property.create({
    data: {
      title: 'Cozy Mountain Cabin',
      description:
        'Escape to this charming mountain cabin surrounded by nature. Features a fireplace, hot tub, and stunning mountain views. Ideal for couples or small families seeking peace and tranquility.',
      type: 'ENTIRE_PLACE',
      category: 'CABIN',
      status: 'ACTIVE',
      hostId: hostUser.id,
      country: 'United States',
      state: 'Colorado',
      city: 'Aspen',
      address: '456 Mountain Road',
      zipCode: '81611',
      latitude: 39.1911,
      longitude: -106.8175,
      guests: 4,
      bedrooms: 2,
      beds: 2,
      bathrooms: 2,
      amenities: [
        'WiFi',
        'Hot Tub',
        'Fireplace',
        'Kitchen',
        'Heating',
        'Free Parking',
        'Mountain View',
        'Washer/Dryer',
      ],
      pricePerNight: 275,
      cleaningFee: 100,
      images: [
        'https://images.unsplash.com/photo-1542718610-a1d656d1884c',
        'https://images.unsplash.com/photo-1587061949409-02df41d5e562',
      ],
      instantBook: false,
      minNights: 3,
      maxNights: 14,
    },
  })

  const property3 = await prisma.property.create({
    data: {
      title: 'Modern Downtown Apartment',
      description:
        'Stylish apartment in the heart of downtown. Walking distance to restaurants, shops, and entertainment. Perfect for business travelers or city explorers.',
      type: 'ENTIRE_PLACE',
      category: 'APARTMENT',
      status: 'ACTIVE',
      hostId: hostUser.id,
      country: 'United States',
      state: 'New York',
      city: 'New York',
      address: '789 Broadway',
      zipCode: '10003',
      latitude: 40.7128,
      longitude: -74.006,
      guests: 2,
      bedrooms: 1,
      beds: 1,
      bathrooms: 1,
      amenities: [
        'WiFi',
        'Kitchen',
        'Air Conditioning',
        'Heating',
        'Elevator',
        'Gym',
        'Doorman',
      ],
      pricePerNight: 180,
      cleaningFee: 75,
      images: [
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267',
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688',
      ],
      instantBook: true,
      minNights: 1,
      maxNights: 30,
    },
  })

  // Create sample review
  await prisma.review.create({
    data: {
      userId: guestUser.id,
      propertyId: property1.id,
      rating: 5,
      cleanliness: 5,
      accuracy: 5,
      checkIn: 5,
      communication: 5,
      location: 5,
      value: 4,
      comment:
        'Amazing property! The views were spectacular and the host was very accommodating. Highly recommend!',
    },
  })

  console.log('Seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
