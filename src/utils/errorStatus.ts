// The HTTP status of an RTK Query error; null when the error has none (a network failure
// has a text status such as "FETCH_ERROR")
export function errorStatus(error: unknown): number | null {
  if (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof error.status === "number"
  ) {
    return error.status
  }
  return null
}
