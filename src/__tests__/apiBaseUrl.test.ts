import { describe, it, expect, jest, afterEach } from "@jest/globals"

// In Jest, Babel rewrites import.meta.env to process.env, so setting it here is what the
// module under test reads when it is loaded.
describe("API_BASE_URL", () => {
  const original = import.meta.env.VITE_API_BASE_URL

  afterEach(() => {
    if (original === undefined) delete import.meta.env.VITE_API_BASE_URL
    else import.meta.env.VITE_API_BASE_URL = original
    jest.resetModules()
  })

  it("is read from import.meta.env at load time", async () => {
    import.meta.env.VITE_API_BASE_URL = "/api/"
    jest.resetModules()

    const { API_BASE_URL } = await import("@/config/apiBaseUrl")

    expect(API_BASE_URL).toBe("/api")
  })
})
