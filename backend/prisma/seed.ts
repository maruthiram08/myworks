import { PrismaClient, UserRole, VehicleType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Create admin user
  const adminPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL || 'admin@ridehailing.com' },
    update: {},
    create: {
      email: process.env.ADMIN_EMAIL || 'admin@ridehailing.com',
      password: adminPassword,
      name: 'Admin User',
      phone: '+1234567890',
      role: UserRole.ADMIN,
      emailVerified: new Date(),
    },
  });

  console.log('Admin user created:', admin.email);

  // Create sample rider
  const riderPassword = await bcrypt.hash('rider123', 10);
  const rider = await prisma.user.upsert({
    where: { email: 'rider@example.com' },
    update: {},
    create: {
      email: 'rider@example.com',
      password: riderPassword,
      name: 'John Rider',
      phone: '+1234567891',
      role: UserRole.RIDER,
      emailVerified: new Date(),
      riderProfile: {
        create: {
          homeAddress: '123 Main St, San Francisco, CA',
          workAddress: '456 Market St, San Francisco, CA',
        },
      },
    },
  });

  console.log('Sample rider created:', rider.email);

  // Create sample drivers
  const driverPassword = await bcrypt.hash('driver123', 10);

  const driver1 = await prisma.user.upsert({
    where: { email: 'driver1@example.com' },
    update: {},
    create: {
      email: 'driver1@example.com',
      password: driverPassword,
      name: 'Mike Driver',
      phone: '+1234567892',
      role: UserRole.DRIVER,
      emailVerified: new Date(),
      driverProfile: {
        create: {
          licenseNumber: 'DL123456',
          licenseExpiry: new Date('2026-12-31'),
          vehicleType: VehicleType.ECONOMY,
          vehicleMake: 'Toyota',
          vehicleModel: 'Camry',
          vehicleYear: 2022,
          vehicleColor: 'Silver',
          vehiclePlate: 'ABC1234',
          isVerified: true,
          isAvailable: true,
          currentLatitude: 37.7749,
          currentLongitude: -122.4194,
        },
      },
    },
  });

  const driver2 = await prisma.user.upsert({
    where: { email: 'driver2@example.com' },
    update: {},
    create: {
      email: 'driver2@example.com',
      password: driverPassword,
      name: 'Sarah Driver',
      phone: '+1234567893',
      role: UserRole.DRIVER,
      emailVerified: new Date(),
      driverProfile: {
        create: {
          licenseNumber: 'DL789012',
          licenseExpiry: new Date('2027-06-30'),
          vehicleType: VehicleType.COMFORT,
          vehicleMake: 'Honda',
          vehicleModel: 'Accord',
          vehicleYear: 2023,
          vehicleColor: 'Black',
          vehiclePlate: 'XYZ5678',
          isVerified: true,
          isAvailable: true,
          currentLatitude: 37.7849,
          currentLongitude: -122.4094,
        },
      },
    },
  });

  console.log('Sample drivers created:', driver1.email, driver2.email);

  // Create system settings
  const settings = [
    { key: 'BASE_FARE', value: '2.50', description: 'Base fare for all rides' },
    { key: 'COST_PER_KM', value: '1.50', description: 'Cost per kilometer' },
    { key: 'COST_PER_MINUTE', value: '0.30', description: 'Cost per minute' },
    { key: 'CANCELLATION_FEE', value: '5.00', description: 'Fee for cancelling after driver accepts' },
    { key: 'SERVICE_FEE_PERCENTAGE', value: '20', description: 'Platform service fee percentage' },
    { key: 'MAX_SEARCH_RADIUS_KM', value: '10', description: 'Maximum radius to search for drivers' },
  ];

  for (const setting of settings) {
    await prisma.systemSettings.upsert({
      where: { key: setting.key },
      update: { value: setting.value, description: setting.description },
      create: setting,
    });
  }

  console.log('System settings created');

  console.log('Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
