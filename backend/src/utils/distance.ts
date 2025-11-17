/**
 * Calculate distance between two coordinates using Haversine formula
 * @param lat1 Latitude of point 1
 * @param lon1 Longitude of point 1
 * @param lat2 Latitude of point 2
 * @param lon2 Longitude of point 2
 * @returns Distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 100) / 100; // Round to 2 decimal places
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Estimate duration based on distance
 * Assumes average speed of 40 km/h in city traffic
 * @param distanceInKm Distance in kilometers
 * @returns Estimated duration in minutes
 */
export function estimateDuration(distanceInKm: number): number {
  const averageSpeedKmPerHour = 40;
  const hours = distanceInKm / averageSpeedKmPerHour;
  const minutes = Math.ceil(hours * 60);
  return minutes;
}

/**
 * Find nearest drivers within a given radius
 * @param latitude User's latitude
 * @param longitude User's longitude
 * @param maxRadiusKm Maximum search radius in kilometers
 * @returns Array of drivers with distance
 */
export function findNearbyDrivers(
  latitude: number,
  longitude: number,
  drivers: Array<{ id: string; currentLatitude: number | null; currentLongitude: number | null }>,
  maxRadiusKm: number = 10
): Array<{ id: string; distance: number }> {
  const nearbyDrivers: Array<{ id: string; distance: number }> = [];

  for (const driver of drivers) {
    if (driver.currentLatitude && driver.currentLongitude) {
      const distance = calculateDistance(
        latitude,
        longitude,
        driver.currentLatitude,
        driver.currentLongitude
      );

      if (distance <= maxRadiusKm) {
        nearbyDrivers.push({
          id: driver.id,
          distance,
        });
      }
    }
  }

  // Sort by distance (nearest first)
  return nearbyDrivers.sort((a, b) => a.distance - b.distance);
}
