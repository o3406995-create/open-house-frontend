import { ApiError } from "./client"

export function getApiErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  if (error instanceof ApiError) {
    const message = (error.data as { message?: unknown } | null)?.message
    if (typeof message === "string") {
      return message
    }
  }

  if (error instanceof Error) {
    return error.message
  }

  return fallback
}