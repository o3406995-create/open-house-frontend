import { propertyDetailsConstants as D } from "@/common/constants"

// Provider data is untrusted: only well-formed values become mailto:/tel: links.
export function toMailtoHref(email: string | null): string | null {
  if (!email) return null
  const trimmed = email.trim()
  return D.EMAIL_PATTERN.test(trimmed) ? `mailto:${trimmed}` : null
}

export function toTelHref(phone: string | null): string | null {
  if (!phone) return null
  const trimmed = phone.trim()
  if (!D.PHONE_PATTERN.test(trimmed)) return null
  return `tel:${trimmed.replace(D.PHONE_STRIP_PATTERN, "")}`
}