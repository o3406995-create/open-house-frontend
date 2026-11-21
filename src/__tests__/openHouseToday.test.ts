import { describe, it, expect } from "@jest/globals"
import type { OpenHouseDTO } from "@/store/propertiesApi"
import { isOpenHouseToday } from "@/utils/formatOpenHouse"

// Local-time dates, so the tests do not depend on the machine's time zone
const local = (day: number, hour: number, minute = 0) => new Date(2026, 10, day, hour, minute)

const openHouse = (start: Date) =>
  ({
    startDatetime: start.toISOString(),
    endDatetime: new Date(start.getTime() + 60 * 60 * 1000).toISOString(),
  }) as OpenHouseDTO

const NOW = local(20, 8).getTime()

describe("isOpenHouseToday", () => {
  it("is true for a later time on the same day", () => {
    expect(isOpenHouseToday(openHouse(local(20, 14)), NOW)).toBe(true)
  })

  it("is true for a time earlier on the same day", () => {
    expect(isOpenHouseToday(openHouse(local(20, 6)), NOW)).toBe(true)
  })

  it("is true at the end of the day", () => {
    expect(isOpenHouseToday(openHouse(local(20, 23, 30)), NOW)).toBe(true)
  })

  it("is false just after midnight tomorrow", () => {
    expect(isOpenHouseToday(openHouse(local(21, 0, 30)), NOW)).toBe(false)
  })

  it("is false for yesterday", () => {
    expect(isOpenHouseToday(openHouse(local(19, 10)), NOW)).toBe(false)
  })
})
