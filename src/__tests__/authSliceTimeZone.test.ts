import { describe, it, expect } from "@jest/globals"
import reducer, { clearUser, setUser, setUserTimeZone } from "@/store/authSlice"
import type { User } from "@/api/types"

const USER: User = {
  user_id: 1,
  name: "Test User",
  email: "test@example.com",
  role: "USER",
  status: "ACTIVE",
}

describe("authSlice: the time zone of the user", () => {
  it("stores the time zone on the logged-in user and keeps the rest", () => {
    const loggedIn = reducer(undefined, setUser(USER))

    const next = reducer(loggedIn, setUserTimeZone("Australia/Sydney"))

    expect(next.user).toEqual({ ...USER, time_zone: "Australia/Sydney" })
  })

  it("replaces the time zone that was stored before", () => {
    const loggedIn = reducer(undefined, setUser({ ...USER, time_zone: "Australia/Brisbane" }))

    const next = reducer(loggedIn, setUserTimeZone("Europe/London"))

    expect(next.user?.time_zone).toBe("Europe/London")
  })

  it("does nothing when nobody is logged in", () => {
    expect(reducer(undefined, setUserTimeZone("UTC")).user).toBeNull()
  })

  it("is gone with the user at logout", () => {
    const loggedIn = reducer(undefined, setUserTimeZone("UTC"))
    const next = reducer(reducer(loggedIn, setUser(USER)), clearUser())

    expect(next.user).toBeNull()
  })
})
