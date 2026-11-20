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

describe("toTelHref", () => {
  it.each([null, "", "   "])("returns null for %p", (phone) => {
    expect(toTelHref(phone)).toBeNull()
  })

  it("builds a tel link and strips the spaces", () => {
    expect(toTelHref("0412 345 678")).toMatch(/^tel:\+?\d+$/)
  })

  it("keeps the country code", () => {
    expect(toTelHref("+61 412 345 678")).toMatch(/^tel:\+61\d+$/)
  })

  it.each(["call me maybe", "javascript:alert(1)", "<script>"])("returns null for %s", (phone) => {
    expect(toTelHref(phone)).toBeNull()
  })
})
