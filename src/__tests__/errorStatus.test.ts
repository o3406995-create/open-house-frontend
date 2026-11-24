import { describe, it, expect } from "@jest/globals"
import { errorStatus } from "@/utils/errorStatus"

describe("errorStatus", () => {
  it.each([401, 403, 404, 500])("returns %p", (status) => {
    expect(errorStatus({ status, data: {} })).toBe(status)
  })

  it.each([null, undefined, "x", 3, {}, { status: "FETCH_ERROR" }, new Error("boom")])(
    "answers null for %p",
    (error) => {
      expect(errorStatus(error)).toBeNull()
    },
  )
})
