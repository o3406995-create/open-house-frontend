import { loginPageConstants } from "@/common/constants"

// Only same-site paths are accepted, so a crafted route state cannot send the user elsewhere.
export function getRedirectTarget(state: unknown): string {
  if (
    typeof state === "object" &&
    state !== null &&
    "from" in state &&
    typeof state.from === "string"
  ) {
    const from = state.from
    if (from.startsWith("/") && !from.startsWith("//")) {
      return from
    }
  }
  return loginPageConstants.POST_LOGIN_ROUTE
}