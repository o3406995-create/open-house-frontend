import { describe, it, expect } from "@jest/globals"
import { addErrorMessage, entryIdFor, findEntry } from "@/utils/addedOpenHouse"
import type {
  MyOpenHouseGroup,
  MyOpenHouseItemDTO,
  MyOpenHousesDTO,
} from "@/store/propertiesApi"
import { myOpenHousesConstants as C } from "@/common/constants"

function entry(
  myOpenHouseId: number,
  propertyExternalId: string,
  openHouseExternalId: string,
  group: MyOpenHouseGroup = "upcoming",
): MyOpenHouseItemDTO {
  return {
    myOpenHouseId,
    addedAt: "2026-11-20T00:00:00.000Z",
    attended: group === "attended",
    group,
    openHouse: {
      externalId: openHouseExternalId,
      startDatetime: "2026-11-25T00:00:00.000Z",
      endDatetime: "2026-11-25T00:30:00.000Z",
      status: "SCHEDULED",
    },
    property: {
      externalId: propertyExternalId,
      source: "mock",
      address: "12 Example Street",
      suburb: "Brisbane",
      state: "QLD",
      postcode: "4000",
      price: 650000,
      displayPrice: "$650,000",
      bedrooms: 3,
      bathrooms: 2,
      carSpaces: 2,
      propertyType: "House",
      latitude: -27.4698,
      longitude: 153.0251,
      thumbnailUrl: null,
      openHouses: [],
    },
  }
}

function listOf(items: MyOpenHouseItemDTO[]): MyOpenHousesDTO {
  const myOpenHouses: MyOpenHousesDTO["myOpenHouses"] = {
    today: [],
    upcoming: [],
    attended: [],
    expired: [],
  }
  for (const item of items) myOpenHouses[item.group].push(item)

  return {
    timeZone: "Australia/Brisbane",
    counts: {
      today: myOpenHouses.today.length,
      upcoming: myOpenHouses.upcoming.length,
      attended: myOpenHouses.attended.length,
      expired: myOpenHouses.expired.length,
    },
    myOpenHouses,
  }
}

describe("findEntry", () => {
  it("finds the entry of an open house of a property", () => {
    const list = listOf([entry(1, "mock-1", "mock-1-0"), entry(2, "mock-2", "mock-2-1")])

    expect(findEntry(list, "mock-2", "mock-2-1")?.myOpenHouseId).toBe(2)
  })

  it.each(["today", "upcoming", "attended", "expired"] as const)(
    "looks in the group %s as well",
    (group) => {
      const list = listOf([entry(5, "mock-1", "mock-1-0", group)])

      expect(findEntry(list, "mock-1", "mock-1-0")?.myOpenHouseId).toBe(5)
    },
  )

  it("does not take an open house with the same id from another property", () => {
    const list = listOf([entry(1, "mock-1", "oh-0")])

    expect(findEntry(list, "mock-2", "oh-0")).toBeUndefined()
  })

  it("does not take another open house of the same property", () => {
    const list = listOf([entry(1, "mock-1", "mock-1-0")])

    expect(findEntry(list, "mock-1", "mock-1-1")).toBeUndefined()
  })

  it("answers undefined when the list has not loaded", () => {
    expect(findEntry(undefined, "mock-1", "mock-1-0")).toBeUndefined()
  })

  it("answers undefined for an empty list", () => {
    expect(findEntry(listOf([]), "mock-1", "mock-1-0")).toBeUndefined()
  })
})

describe("entryIdFor", () => {
  const fromList = entry(7, "mock-1", "mock-1-0")

  it("uses the entry of the list when the button has done nothing yet", () => {
    expect(entryIdFor(null, fromList)).toBe(7)
  })

  it("answers null when it is not in the list either", () => {
    expect(entryIdFor(null, undefined)).toBeNull()
  })

  it("lets what the button just added win over a list that does not have it yet", () => {
    expect(entryIdFor({ myOpenHouseId: 9 }, undefined)).toBe(9)
  })

  it("lets a removal win over a list that still has the entry", () => {
    expect(entryIdFor({ myOpenHouseId: null }, fromList)).toBeNull()
  })
})

describe("addErrorMessage", () => {
  it("says the open house is no longer available after a 409", () => {
    expect(addErrorMessage({ status: 409 })).toBe(C.ADD_UNAVAILABLE_ERROR)
  })

  it("says it could not be found after a 404", () => {
    expect(addErrorMessage({ status: 404 })).toBe(C.ADD_NOT_FOUND_ERROR)
  })

  it.each([{ status: 500 }, { status: 400 }, { status: "FETCH_ERROR" }, null, undefined, "x"])(
    "gives the general message for %p",
    (error) => {
      expect(addErrorMessage(error)).toBe(C.ADD_ERROR)
    },
  )
})
