import { myOpenHousesConstants as C } from "@/common/constants"
import type { MyOpenHouseItemDTO } from "@/store/propertiesApi"

// One marker per property: a property can have several open houses in the same group
export interface MapMarkerData {
  propertyExternalId: string
  address: string
  latitude: number
  longitude: number
  // Earliest first
  items: MyOpenHouseItemDTO[]
  // True when at least one of the open houses is today or upcoming
  active: boolean
}

export interface MapData {
  markers: MapMarkerData[]
  // Open houses whose property has no usable location; they cannot be put on the map
  withoutLocation: number
}

export interface MapBounds {
  north: number
  south: number
  east: number
  west: number
}

function byStart(a: MyOpenHouseItemDTO, b: MyOpenHouseItemDTO): number {
  return (
    new Date(a.openHouse.startDatetime).getTime() - new Date(b.openHouse.startDatetime).getTime()
  )
}

function isActive(item: MyOpenHouseItemDTO): boolean {
  return C.MAP_ACTIVE_GROUPS.some((group) => group === item.group)
}

export function buildMapData(items: MyOpenHouseItemDTO[]): MapData {
  const byProperty = new Map<string, MapMarkerData>()
  let withoutLocation = 0

  for (const item of items) {
    const { externalId, address, latitude, longitude } = item.property

    if (
      latitude === null ||
      longitude === null ||
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude)
    ) {
      withoutLocation += 1
      continue
    }

    const existing = byProperty.get(externalId)
    if (existing) {
      existing.items.push(item)
    } else {
      byProperty.set(externalId, {
        propertyExternalId: externalId,
        address,
        latitude,
        longitude,
        items: [item],
        active: false,
      })
    }
  }

  const markers = [...byProperty.values()].map((marker) => ({
    ...marker,
    items: [...marker.items].sort(byStart),
    active: marker.items.some(isActive),
  }))

  return { markers, withoutLocation }
}

// The smallest box that holds every marker; null when there is none
export function getBounds(markers: MapMarkerData[]): MapBounds | null {
  if (markers.length === 0) return null

  const latitudes = markers.map((marker) => marker.latitude)
  const longitudes = markers.map((marker) => marker.longitude)

  return {
    north: Math.max(...latitudes),
    south: Math.min(...latitudes),
    east: Math.max(...longitudes),
    west: Math.min(...longitudes),
  }
}
