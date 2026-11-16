import { apiConstants } from "@/common/constants"

// The single source of the API base URL. A relative value such as "/api" is valid
// (same-origin requests through a proxy), so no scheme is required.
// An empty value falls back to the default; trailing slashes are removed.
export const API_BASE_URL: string = (
  import.meta.env.VITE_API_BASE_URL || apiConstants.DEFAULT_BASE_URL
).replace(/\/+$/, "")