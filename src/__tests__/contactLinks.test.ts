import { describe, it, expect } from "@jest/globals"
import { toMailtoHref, toTelHref } from "@/utils/contactLinks"

describe("toMailtoHref", () => {
  it.each([null, "", "   "])("returns null for %p", (email) => {
    expect(toMailtoHref(email)).toBeNull()
  })

  it("builds a mailto link for a normal address", () => {
    expect(toMailtoHref("agent@example.com")).toBe("mailto:agent@example.com")
  })

  it("trims surrounding whitespace", () => {
    expect(toMailtoHref("  agent@example.com  ")).toBe("mailto:agent@example.com")
  })

  it.each(["not-an-email", "agent@", "@example.com", "agent @example.com", "javascript:alert(1)"])(
    "returns null for %s",
    (email) => {
      expect(toMailtoHref(email)).toBeNull()
    },
  )
})

// PHONE_PATTERN allows digits, +, brackets, hyphens and whitespace, 6 to 20 characters long;
// PHONE_STRIP_PATTERN then removes everything that is not a digit or a +.
describe("toTelHref", () => {
  it.each([null, "", "   "])("returns null for %p", (phone) => {
    expect(toTelHref(phone)).toBeNull()
  })

  it("builds a tel link and strips the spaces", () => {
    expect(toTelHref("0412 345 678")).toBe("tel:0412345678")
  })

  it("keeps the country code", () => {
    expect(toTelHref("+61 412 345 678")).toBe("tel:+61412345678")
  })

  it("strips brackets and hyphens as well", () => {
    expect(toTelHref("(07) 3000-0000")).toBe("tel:0730000000")
  })

  it("trims surrounding whitespace", () => {
    expect(toTelHref("  0412 345 678  ")).toBe("tel:0412345678")
  })

  it("accepts the shortest and the longest allowed values", () => {
    expect(toTelHref("123456")).toBe("tel:123456")
    expect(toTelHref("1".repeat(20))).toBe(`tel:${"1".repeat(20)}`)
  })

  it("rejects values that are too short or too long", () => {
    expect(toTelHref("12345")).toBeNull()
    expect(toTelHref("1".repeat(21))).toBeNull()
  })

  it.each(["call me maybe", "0412 345 abc", "javascript:alert(1)", "<script>"])(
    "returns null for %s",
    (phone) => {
      expect(toTelHref(phone)).toBeNull()
    },
  )
})
