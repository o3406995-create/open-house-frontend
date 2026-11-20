import { describe, it, expect } from "@jest/globals"
import { propertyDetailsConstants as D } from "@/common/constants"
import type { OpenHouseDTO } from "@/store/propertiesApi"
import {
  formatOpenHouseDate,
  formatOpenHouseTime,
  getUpcomingOpenHouses,
} from "@/utils/formatOpenHouse"

// Only the two timestamps matter to these functions
const openHouse = (startDatetime: string, endDatetime: string) =>
  ({ startDatetime, endDatetime }) as OpenHouseDTO

const starts = (list: OpenHouseDTO[]) => list.map((item) => item.startDatetime)

describe("formatOpenHouseDate and formatOpenHouseTime", () => {
  // The formatters use the browser's time zone, so the expected values are built with the
  // same Intl options instead of hardcoded strings.
  const dateFormat = new Intl.DateTimeFormat(D.LOCALE, {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  })
  const timeFormat = new Intl.DateTimeFormat(D.LOCALE, { hour: "numeric", minute: "2-digit" })
  const item = openHouse("2026-11-19T00:00:00.000Z", "2026-11-19T00:30:00.000Z")

  it("formats the date from the start time", () => {
    expect(formatOpenHouseDate(item)).toBe(dateFormat.format(new Date(item.startDatetime)))
  })

  it("does not use the end time for the date", () => {
    const endsMuchLater = openHouse("2026-11-19T00:00:00.000Z", "2026-11-30T00:00:00.000Z")

    expect(formatOpenHouseDate(endsMuchLater)).toBe(formatOpenHouseDate(item))
  })

  it("formats the time as a range from start to end", () => {
    expect(formatOpenHouseTime(item)).toBe(
      D.TIME_RANGE(
        timeFormat.format(new Date(item.startDatetime)),
        timeFormat.format(new Date(item.endDatetime)),
      ),
    )
  })
})

describe("getUpcomingOpenHouses", () => {
  const NOW = Date.parse("2026-11-18T00:00:00.000Z")

  it("drops open houses that already finished", () => {
    const past = openHouse("2026-11-17T01:00:00.000Z", "2026-11-17T02:00:00.000Z")
    const future = openHouse("2026-11-19T01:00:00.000Z", "2026-11-19T02:00:00.000Z")

    expect(starts(getUpcomingOpenHouses([past, future], NOW))).toEqual([future.startDatetime])
  })

  it("drops one that ends exactly now", () => {
    const ending = openHouse("2026-11-17T23:00:00.000Z", "2026-11-18T00:00:00.000Z")

    expect(getUpcomingOpenHouses([ending], NOW)).toEqual([])
  })

  it("keeps one that is in progress", () => {
    const running = openHouse("2026-11-17T23:30:00.000Z", "2026-11-18T00:30:00.000Z")

    expect(starts(getUpcomingOpenHouses([running], NOW))).toEqual([running.startDatetime])
  })

  it("sorts by start time, earliest first", () => {
    const late = openHouse("2026-11-20T01:00:00.000Z", "2026-11-20T02:00:00.000Z")
    const early = openHouse("2026-11-19T01:00:00.000Z", "2026-11-19T02:00:00.000Z")

    expect(starts(getUpcomingOpenHouses([late, early], NOW))).toEqual([
      early.startDatetime,
      late.startDatetime,
    ])
  })

  it("does not change the list it was given", () => {
    const late = openHouse("2026-11-20T01:00:00.000Z", "2026-11-20T02:00:00.000Z")
    const early = openHouse("2026-11-19T01:00:00.000Z", "2026-11-19T02:00:00.000Z")
    const input = [late, early]

    getUpcomingOpenHouses(input, NOW)

    expect(starts(input)).toEqual([late.startDatetime, early.startDatetime])
  })

  it("returns an empty list for no open houses", () => {
    expect(getUpcomingOpenHouses([], NOW)).toEqual([])
  })
})
