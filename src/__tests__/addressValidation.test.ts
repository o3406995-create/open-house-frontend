import { describe, it, expect } from "@jest/globals"
import { searchPageConstants as C } from "@/common/constants"
import { isValidAddress } from "@/utils/addressValidation"

describe("isValidAddress", () => {
  it("rejects empty and whitespace-only input", () => {
    expect(isValidAddress("")).toBe(false)
    expect(isValidAddress("     ")).toBe(false)
  })

  it("rejects input shorter than the minimum length", () => {
    expect(isValidAddress("a".repeat(C.MIN_ADDRESS_LENGTH - 1))).toBe(false)
  })

  it("accepts input of exactly the minimum length", () => {
    expect(isValidAddress("a".repeat(C.MIN_ADDRESS_LENGTH))).toBe(true)
  })

  it("accepts a normal address", () => {
    expect(isValidAddress("12 Example Street, Brisbane")).toBe(true)
  })

  it("ignores surrounding whitespace", () => {
    expect(isValidAddress(`  ${"a".repeat(C.MIN_ADDRESS_LENGTH)}  `)).toBe(true)
  })

  it("does not count padding towards the minimum length", () => {
    expect(isValidAddress(`  ${"a".repeat(C.MIN_ADDRESS_LENGTH - 1)}  `)).toBe(false)
  })

  it("rejects markup characters", () => {
    expect(isValidAddress("<script>alert(1)</script>")).toBe(false)
  })
})
