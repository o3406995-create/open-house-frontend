import { searchPageConstants as C } from "@/common/constants"
import { mockGeocode } from "@/utils/mockGeocode"

export interface AddressSuggestion {
  placeId: string
  description: string
}

export interface GeocodeResult {
  latitude: number
  longitude: number
}

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

let sessionToken: google.maps.places.AutocompleteSessionToken | null = null

function getSessionToken(): google.maps.places.AutocompleteSessionToken {
  if (!sessionToken) {
    sessionToken = new window.google.maps.places.AutocompleteSessionToken()
  }
  return sessionToken
}

function clearSessionToken() {
  sessionToken = null
}

function isPlacesApiAvailable(): boolean {
  return Boolean(
    GOOGLE_MAPS_API_KEY &&
      typeof window !== "undefined" &&
      window.google?.maps?.places,
  )
}

export async function fetchAddressSuggestions(
  input: string,
): Promise<AddressSuggestion[]> {
  if (!isPlacesApiAvailable() || input.trim().length === 0) {
    return []
  }

  try {
    const { suggestions } =
      await window.google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
        input,
        includedRegionCodes: [C.AUTOCOMPLETE_COUNTRY_RESTRICTION],
        sessionToken: getSessionToken(),
      })

    return suggestions
      .filter((s) => s.placePrediction)
      .map((s) => ({
        placeId: s.placePrediction!.placeId,
        description: s.placePrediction!.text.text,
      }))
  } catch {
    return []
  }
}

export async function geocodeSelectedPlace(
  placeId: string,
  fallbackAddress: string,
): Promise<GeocodeResult> {
  if (!isPlacesApiAvailable()) {
    return mockGeocode(fallbackAddress)
  }

  try {
    const place = new window.google.maps.places.Place({ id: placeId })
    await place.fetchFields({ fields: ["location"] })

    const location = place.location
    if (!location) {
      return mockGeocode(fallbackAddress)
    }

    const result = {
      latitude: location.lat(),
      longitude: location.lng(),
    }

    clearSessionToken()
    return result
  } catch {
    return mockGeocode(fallbackAddress)
  }
}

export async function geocodeFreeTextAddress(
  address: string,
): Promise<GeocodeResult> {
  return mockGeocode(address)
}