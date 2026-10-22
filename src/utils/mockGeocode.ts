interface GeocodeResult {
  latitude: number
  longitude: number
}

const MOCK_LOCATIONS: Record<string, GeocodeResult> = {
  "mosman nsw": { latitude: -33.8279, longitude: 151.2446 },
  brisbane: { latitude: -27.4698, longitude: 153.0251 },
  "south brisbane": { latitude: -27.4818, longitude: 153.0171 },
  "new farm": { latitude: -27.4654, longitude: 153.0509 },
  "west end": { latitude: -27.4823, longitude: 153.0088 },
  "fortitude valley": { latitude: -27.456, longitude: 153.0344 },
}

const DEFAULT_LOCATION: GeocodeResult = { latitude: -27.4698, longitude: 153.0251 }

// Matches "lat, lng" e.g. "-27.4698, 153.0251"
const COORDINATE_PATTERN = /^(-?\d+(\.\d+)?)\s*,\s*(-?\d+(\.\d+)?)$/

const MOCK_LATENCY_MS = 300

export async function mockGeocode(address: string): Promise<GeocodeResult> {
  const trimmed = address.trim()

  await new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY_MS))

  const coordMatch = trimmed.match(COORDINATE_PATTERN)
  if (coordMatch) {
    return {
      latitude: parseFloat(coordMatch[1]),
      longitude: parseFloat(coordMatch[3]),
    }
  }

  return MOCK_LOCATIONS[trimmed.toLowerCase()] ?? DEFAULT_LOCATION
}