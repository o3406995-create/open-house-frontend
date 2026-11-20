import { describe, it, expect } from "@jest/globals"
import { loginPageConstants } from "@/common/constants"
import { getRedirectTarget } from "@/utils/authRedirect"

const DEFAULT_ROUTE = loginPageConstants.POST_LOGIN_ROUTE

describe("getRedirectTarget", () => {
  it("returns a same-site path from the route state", () => {
    expect(getRedirectTarget({ from: "/properties/mock-1" })).toBe("/properties/mock-1")
  })

  it("keeps the query string", () => {
    expect(getRedirectTarget({ from: "/search?lat=-27.4&lng=153" })).toBe("/search?lat=-27.4&lng=153")
  })

  it.each(["//evil.com", "https://evil.com", "javascript:alert(1)", "evil.com/path", ""])(
    "falls back to the default for %p",
    (from) => {
      expect(getRedirectTarget({ from })).toBe(DEFAULT_ROUTE)
    },
  )

  it.each([null, undefined, "/properties/mock-1", 42, {}, { from: 42 }, { from: null }])(
    "falls back to the default for the state %p",
    (state) => {
      expect(getRedirectTarget(state)).toBe(DEFAULT_ROUTE)
    },
  )
})
