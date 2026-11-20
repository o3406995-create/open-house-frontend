import { resolveApiBaseUrl } from "@/config/resolveApiBaseUrl"

// The single source of the API base URL: every request module imports it from here.
export const API_BASE_URL: string = resolveApiBaseUrl(import.meta.env.VITE_API_BASE_URL)
