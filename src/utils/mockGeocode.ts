// Temporary mock geocoding until Google Maps Geocoding API is integrated (#34).
// Replace mockGeocode's implementation with a real API call once the key is available;
// callers don't need to change.

interface GeocodeResult {
  latitude: number
  longitude: number
}

const MOCK_LOCATIONS: Record<string, GeocodeResult> = {
  "mosman nsw": { latitude: -33.8279, longitude: 151.2446 },
  "brisbane": { latitude: -27.4698, longitude: 153.0251 },
  "south brisbane": { latitude: -27.4818, longitude: 153.0171 },
  "new farm": { latitude: -27.4654, longitude: 153.0509 },
  "west end": { latitude: -27.4823, longitude: 153.0088 },
}

const DEFAULT_LOCATION: GeocodeResult = { latitude: -27.4698, longitude: 153.0251 }

export async function mockGeocode(address: string): Promise<GeocodeResult> {
  const key = address.trim().toLowerCase()
  const match = MOCK_LOCATIONS[key]

  await new Promise((resolve) => setTimeout(resolve, 300))

  return match ?? DEFAULT_LOCATION
}