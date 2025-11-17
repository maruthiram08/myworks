import { PrismaClient, VehicleType } from '@prisma/client';

const prisma = new PrismaClient();

interface FareCalculation {
  baseFare: number;
  distanceFare: number;
  timeFare: number;
  surgeFare: number;
  totalFare: number;
  estimatedDistance: number;
  estimatedDuration: number;
}

// Vehicle type multipliers
const VEHICLE_TYPE_MULTIPLIERS: Record<VehicleType, number> = {
  ECONOMY: 1.0,
  COMFORT: 1.3,
  PREMIUM: 1.8,
  XL: 1.5,
};

/**
 * Calculate fare for a ride
 * @param distanceInKm Distance in kilometers
 * @param durationInMinutes Duration in minutes
 * @param vehicleType Type of vehicle
 * @param surgeMultiplier Surge pricing multiplier (default 1.0)
 * @returns Fare breakdown
 */
export async function calculateFare(
  distanceInKm: number,
  durationInMinutes: number,
  vehicleType: VehicleType = VehicleType.ECONOMY,
  surgeMultiplier: number = 1.0
): Promise<FareCalculation> {
  // Get pricing settings from database
  const settings = await prisma.systemSettings.findMany({
    where: {
      key: {
        in: ['BASE_FARE', 'COST_PER_KM', 'COST_PER_MINUTE'],
      },
    },
  });

  const baseFareValue = parseFloat(settings.find((s) => s.key === 'BASE_FARE')?.value || '2.50');
  const costPerKm = parseFloat(settings.find((s) => s.key === 'COST_PER_KM')?.value || '1.50');
  const costPerMinute = parseFloat(settings.find((s) => s.key === 'COST_PER_MINUTE')?.value || '0.30');

  // Apply vehicle type multiplier
  const vehicleMultiplier = VEHICLE_TYPE_MULTIPLIERS[vehicleType];

  // Calculate components
  const baseFare = baseFareValue * vehicleMultiplier;
  const distanceFare = distanceInKm * costPerKm * vehicleMultiplier;
  const timeFare = durationInMinutes * costPerMinute * vehicleMultiplier;

  // Calculate subtotal before surge
  const subtotal = baseFare + distanceFare + timeFare;

  // Calculate surge fare
  const surgeFare = subtotal * (surgeMultiplier - 1);

  // Calculate total
  const totalFare = Math.round((subtotal + surgeFare) * 100) / 100;

  return {
    baseFare: Math.round(baseFare * 100) / 100,
    distanceFare: Math.round(distanceFare * 100) / 100,
    timeFare: Math.round(timeFare * 100) / 100,
    surgeFare: Math.round(surgeFare * 100) / 100,
    totalFare,
    estimatedDistance: distanceInKm,
    estimatedDuration: durationInMinutes,
  };
}

/**
 * Get surge multiplier for a location
 * @param latitude Pickup latitude
 * @param longitude Pickup longitude
 * @returns Surge multiplier
 */
export async function getSurgeMultiplier(
  latitude: number,
  longitude: number
): Promise<number> {
  try {
    const surgeAreas = await prisma.surgeArea.findMany({
      where: {
        isActive: true,
      },
    });

    // Check if location is within any surge area
    for (const area of surgeAreas) {
      if (isPointInPolygon(latitude, longitude, area.coordinates as any)) {
        // Check if surge is within time window
        const now = new Date();
        if (
          (!area.startTime || area.startTime <= now) &&
          (!area.endTime || area.endTime >= now)
        ) {
          return area.surgeMultiplier;
        }
      }
    }

    return 1.0; // No surge
  } catch (error) {
    console.error('Error getting surge multiplier:', error);
    return 1.0;
  }
}

/**
 * Check if a point is inside a polygon using ray casting algorithm
 */
function isPointInPolygon(
  latitude: number,
  longitude: number,
  polygon: Array<[number, number]>
): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0];
    const yi = polygon[i][1];
    const xj = polygon[j][0];
    const yj = polygon[j][1];

    const intersect =
      yi > longitude !== yj > longitude &&
      latitude < ((xj - xi) * (longitude - yi)) / (yj - yi) + xi;

    if (intersect) inside = !inside;
  }
  return inside;
}

/**
 * Calculate cancellation fee
 * @param rideStatus Current ride status
 * @param cancelledBy Who cancelled (rider or driver)
 * @returns Cancellation fee
 */
export async function calculateCancellationFee(
  rideStatus: string,
  cancelledBy: 'rider' | 'driver'
): Promise<number> {
  // Only charge cancellation fee if driver already accepted and rider cancels
  if (cancelledBy === 'rider' && (rideStatus === 'ACCEPTED' || rideStatus === 'DRIVER_ARRIVED')) {
    const settings = await prisma.systemSettings.findUnique({
      where: { key: 'CANCELLATION_FEE' },
    });
    return parseFloat(settings?.value || '5.00');
  }

  return 0;
}
