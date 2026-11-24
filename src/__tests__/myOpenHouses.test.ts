import { describe, it, expect } from "@jest/globals"
import {
  canMarkAttended,
  getBrowserTimeZone,
  isNotFoundError,
  isNotStartedError,
  listNeedsRefresh,
  parseTab,
  parseView,
  pickDefaultTab,
  tagsToInvalidate,
} from "@/utils/myOpenHouses"
import { myOpenHousesConstants as M } from "@/common/constants"

describe("parseTab", () => {
  it.each(["today", "upcoming", "attended", "expired"])("accepts %s", (value) => {
    expect(parseTab(value)).toBe(value)
  })

  it.each([null, "", "Today", "map", "all"])("answers null for %p", (value) => {
    expect(parseTab(value)).toBeNull()
  })
})

describe("parseView", () => {
  it.each(["list", "map"])("accepts %s", (value) => {
    expect(parseView(value)).toBe(value)
  })

  it.each([null, "", "grid", "Map"])("falls back to the list for %p", (value) => {
    expect(parseView(value)).toBe("list")
  })
})

describe("pickDefaultTab", () => {
  it("picks the first tab that has something in it", () => {
    expect(pickDefaultTab({ today: 0, upcoming: 3, attended: 5, expired: 1 })).toBe("upcoming")
  })

  it("keeps today when it has something in it", () => {
    expect(pickDefaultTab({ today: 2, upcoming: 3, attended: 5, expired: 1 })).toBe("today")
  })

  it("can land on the last tab", () => {
    expect(pickDefaultTab({ today: 0, upcoming: 0, attended: 0, expired: 4 })).toBe("expired")
  })

  it("falls back to today when everything is empty", () => {
    expect(pickDefaultTab({ today: 0, upcoming: 0, attended: 0, expired: 0 })).toBe("today")
  })
})

describe("getBrowserTimeZone", () => {
  it("returns the time zone the browser reports", () => {
    expect(getBrowserTimeZone(() => "Australia/Sydney")).toBe("Australia/Sydney")
  })

  it.each([
    ["an empty name", () => ""],
    ["no name", () => undefined],
    [
      "a browser that throws",
      () => {
        throw new Error("no Intl")
      },
    ],
  ])("falls back to the default for %s", (_label, resolve) => {
    expect(getBrowserTimeZone(resolve)).toBe(M.DEFAULT_TIME_ZONE)
  })

  it("reads the real browser by default", () => {
    expect(getBrowserTimeZone().length).toBeGreaterThan(0)
  })
})

describe("canMarkAttended", () => {
  const NOW = Date.parse("2026-11-22T01:29:00.000Z")

  const entry = (startDatetime: string, attended = false) => ({
    attended,
    openHouse: {
      externalId: "oh-1",
      startDatetime,
      endDatetime: "2026-11-26T00:00:00.000Z",
      status: "SCHEDULED" as const,
    },
  })

  it("allows an open house that has started", () => {
    expect(canMarkAttended(entry("2026-11-22T01:00:00.000Z"), NOW)).toBe(true)
  })

  it("allows an open house that has finished", () => {
    expect(canMarkAttended(entry("2026-11-20T00:00:00.000Z"), NOW)).toBe(true)
  })

  it("allows an open house that starts exactly now", () => {
    expect(canMarkAttended(entry("2026-11-22T01:29:00.000Z"), NOW)).toBe(true)
  })

  it("refuses an open house that starts one millisecond later", () => {
    expect(canMarkAttended(entry("2026-11-22T01:29:00.001Z"), NOW)).toBe(false)
  })

  it("refuses an entry that is attended already", () => {
    expect(canMarkAttended(entry("2026-11-20T00:00:00.000Z", true), NOW)).toBe(false)
  })

  it("refuses an entry whose start time cannot be read", () => {
    expect(canMarkAttended(entry("not a date"), NOW)).toBe(false)
  })
})

describe("isNotFoundError and isNotStartedError", () => {
  it("recognise the status of an RTK Query error", () => {
    expect(isNotFoundError({ status: 404, data: {} })).toBe(true)
    expect(isNotStartedError({ status: 409, data: {} })).toBe(true)
  })

  it.each([{ status: 409 }, { status: 500 }, { status: "FETCH_ERROR" }, null, undefined, "x", new Error("boom")])(
    "isNotFoundError is false for %p",
    (error) => {
      expect(isNotFoundError(error)).toBe(false)
    },
  )

  it.each([{ status: 404 }, { status: 500 }, { status: "FETCH_ERROR" }, null, undefined, "x", new Error("boom")])(
    "isNotStartedError is false for %p",
    (error) => {
      expect(isNotStartedError(error)).toBe(false)
    },
  )
})

describe("listNeedsRefresh", () => {
  it.each([undefined, null, { status: 404 }])("is true for %p", (error) => {
    expect(listNeedsRefresh(error)).toBe(true)
  })

  it.each([
    { status: 400 },
    { status: 401 },
    { status: 403 },
    { status: 409 },
    { status: 500 },
    { status: "FETCH_ERROR" },
  ])("is false for %p", (error) => {
    expect(listNeedsRefresh(error)).toBe(false)
  })
})

describe("tagsToInvalidate", () => {
  it("refreshes My Open Houses after a success", () => {
    expect(tagsToInvalidate(undefined)).toEqual([M.API_TAG])
  })

  it("refreshes My Open Houses when the entry was already gone", () => {
    expect(tagsToInvalidate({ status: 404 })).toEqual([M.API_TAG])
  })

  it.each([{ status: 409 }, { status: 500 }, { status: "FETCH_ERROR" }])(
    "leaves the list alone after %p",
    (error) => {
      expect(tagsToInvalidate(error)).toEqual([])
    },
  )
})
