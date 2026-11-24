import { describe, it, expect } from "@jest/globals"
import { buildMapData, getBounds } from "@/utils/myOpenHousesMap"
import type { MyOpenHouseGroup, MyOpenHouseItemDTO } from "@/store/propertiesApi"

function entry(
  id: number,
  propertyId: string,
  group: MyOpenHouseGroup,
  latitude: number | null,
  longitude: number | null,
  startDay = 25,
): MyOpenHouseItemDTO {
  return {
    myOpenHouseId: id,
    addedAt: "2026-11-20T00:00:00.000Z",
    attended: group === "attended",
    group,
    openHouse: {
      externalId: "oh-" + id,
      startDatetime: "2026-11-" + startDay + "T00:00:00.000Z",
      endDatetime: "2026-11-" + startDay + "T00:30:00.000Z",
      status: "SCHEDULED",
    },
    property: {
      externalId: propertyId,
      source: "mock",
      address: propertyId + " Example Street",
      suburb: "Brisbane",
      state: "QLD",
      postcode: "4000",
      price: 650000,
      displayPrice: "$650,000",
      bedrooms: 3,
      bathrooms: 2,
      carSpaces: 2,
      propertyType: "House",
      latitude,
      longitude,
      thumbnailUrl: null,
      openHouses: [],
    },
  }
}

describe("buildMapData", () => {
  it("makes one marker per property with its address and location", () => {
    const { markers } = buildMapData([entry(1, "mock-1", "upcoming", -27.4, 153.0)])

    expect(markers).toHaveLength(1)
    expect(markers[0]).toMatchObject({
      propertyExternalId: "mock-1",
      address: "mock-1 Example Street",
      latitude: -27.4,
      longitude: 153.0,
    })
  })

  it("puts the open houses of one property into one marker, earliest first", () => {
    const { markers } = buildMapData([
      entry(1, "mock-1", "upcoming", -27.4, 153.0, 28),
      entry(2, "mock-1", "upcoming", -27.4, 153.0, 25),
      entry(3, "mock-2", "upcoming", -27.5, 153.1, 26),
    ])

    expect(markers).toHaveLength(2)
    expect(markers[0]?.items.map((item) => item.myOpenHouseId)).toEqual([2, 1])
    expect(markers[1]?.items.map((item) => item.myOpenHouseId)).toEqual([3])
  })

  it.each([
    ["no latitude", null, 153.0],
    ["no longitude", -27.4, null],
    ["a latitude that is not a number", Number.NaN, 153.0],
    ["a longitude that is not finite", -27.4, Number.POSITIVE_INFINITY],
  ])("counts an open house with %s and leaves it off the map", (_label, latitude, longitude) => {
    const data = buildMapData([
      entry(1, "mock-1", "upcoming", latitude, longitude),
      entry(2, "mock-2", "upcoming", -27.5, 153.1),
    ])

    expect(data.withoutLocation).toBe(1)
    expect(data.markers.map((marker) => marker.propertyExternalId)).toEqual(["mock-2"])
  })

  it.each(["today", "upcoming"] as const)("marks a property with a %s open house as active", (group) => {
    expect(buildMapData([entry(1, "mock-1", group, -27.4, 153.0)]).markers[0]?.active).toBe(true)
  })

  it.each(["attended", "expired"] as const)("does not mark a property with only %s open houses", (group) => {
    expect(buildMapData([entry(1, "mock-1", group, -27.4, 153.0)]).markers[0]?.active).toBe(false)
  })

  it("marks a property as active when only one of its open houses is", () => {
    const { markers } = buildMapData([
      entry(1, "mock-1", "expired", -27.4, 153.0, 20),
      entry(2, "mock-1", "upcoming", -27.4, 153.0, 28),
    ])

    expect(markers[0]?.active).toBe(true)
  })

  it("answers an empty map for no open houses", () => {
    expect(buildMapData([])).toEqual({ markers: [], withoutLocation: 0 })
  })
})

describe("getBounds", () => {
  it("answers null when there is no marker", () => {
    expect(getBounds([])).toBeNull()
  })

  it("is a single point for one marker", () => {
    const { markers } = buildMapData([entry(1, "mock-1", "upcoming", -27.4, 153.0)])

    expect(getBounds(markers)).toEqual({ north: -27.4, south: -27.4, east: 153.0, west: 153.0 })
  })

  it("holds every marker", () => {
    const { markers } = buildMapData([
      entry(1, "mock-1", "upcoming", -27.4, 153.0),
      entry(2, "mock-2", "upcoming", -27.9, 152.6),
      entry(3, "mock-3", "upcoming", -27.1, 153.4),
    ])

    expect(getBounds(markers)).toEqual({ north: -27.1, south: -27.9, east: 153.4, west: 152.6 })
  })
})
