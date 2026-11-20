import { apiConstants } from "@/common/constants"

// A relative value such as "/api" is valid (same-origin requests through a proxy), so no
// scheme is required. An empty value falls back to the default; trailing slashes are removed.
export function resolveApiBaseUrl(value: string | undefined): string {
  return (value || apiConstants.DEFAULT_BASE_URL).replace(/\/+$/, "")
}
