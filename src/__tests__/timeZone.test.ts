import { describe, it, expect, jest, afterEach } from "@jest/globals"
import { browserTimeZone, shouldReportTimeZone } from "@/utils/timeZone"

afterEach(() => {
  jest.restoreAllMocks()
})

// The browser says it is on this time zone (or something that is not a name)
function browserSays(timeZone: unknown) {
  jest
    .spyOn(Intl, "DateTimeFormat")
    .mockImplementation((() => ({ resolvedOptions: () => ({ timeZone }) })) as unknown as typeof Intl.DateTimeFormat)
}

describe("browserTimeZone", () => {
  it("answers the time zone the browser says it is on", () => {
    browserSays("Australia/Sydney")

    expect(browserTimeZone()).toBe("Australia/Sydney")
  })

  it.each([
    ["an empty name", ""],
    ["no name", undefined],
    ["something that is not a name", 5],
  ])("answers null for %s", (_label, value) => {
    browserSays(value)

    expect(browserTimeZone()).toBeNull()
  })

  it("answers null when the browser cannot tell", () => {
    jest.spyOn(Intl, "DateTimeFormat").mockImplementation(() => {
      throw new Error("no Intl")
    })

    expect(browserTimeZone()).toBeNull()
  })
})

describe("shouldReportTimeZone", () => {
  it("reports a time zone when the server has none stored", () => {
    expect(shouldReportTimeZone(null, "Australia/Sydney")).toBe(true)
  })

  it("reports a time zone when the user has no such field at all", () => {
    expect(shouldReportTimeZone(undefined, "Australia/Sydney")).toBe(true)
  })

  it("reports a time zone that is not the one stored", () => {
    expect(shouldReportTimeZone("Australia/Brisbane", "Australia/Sydney")).toBe(true)
  })

  it("does not report the time zone that is stored already", () => {
    expect(shouldReportTimeZone("Australia/Sydney", "Australia/Sydney")).toBe(false)
  })

  it("does not report an empty name", () => {
    expect(shouldReportTimeZone(null, "")).toBe(false)
  })
})
