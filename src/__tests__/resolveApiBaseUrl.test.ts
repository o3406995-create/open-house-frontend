import { describe, it, expect } from "@jest/globals"
import { apiConstants } from "@/common/constants"
import { resolveApiBaseUrl } from "@/config/resolveApiBaseUrl"

describe("resolveApiBaseUrl", () => {
  it("keeps a relative path used for same-origin requests", () => {
    expect(resolveApiBaseUrl("/api")).toBe("/api")
  })

  it("keeps a full URL", () => {
    expect(resolveApiBaseUrl("https://api.example.com/api")).toBe("https://api.example.com/api")
  })

  it("removes trailing slashes", () => {
    expect(resolveApiBaseUrl("/api/")).toBe("/api")
    expect(resolveApiBaseUrl("https://api.example.com/api//")).toBe("https://api.example.com/api")
  })

  it("falls back to the default when the value is missing or empty", () => {
    expect(resolveApiBaseUrl(undefined)).toBe(apiConstants.DEFAULT_BASE_URL)
    expect(resolveApiBaseUrl("")).toBe(apiConstants.DEFAULT_BASE_URL)
  })
})
