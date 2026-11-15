import { searchPageConstants as C } from "@/common/constants"

export function isValidAddress(input: string): boolean {
  const trimmed = input.trim()
  return trimmed.length >= C.MIN_ADDRESS_LENGTH && C.ADDRESS_PATTERN.test(trimmed)
}