// The IANA time zone the browser says it is on, or null when it does not say
export function browserTimeZone(): string | null {
  try {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone
    return typeof zone === "string" && zone.length > 0 ? zone : null
  } catch {
    return null
  }
}

// True when the browser is on a time zone that is not the one the server has stored (nothing stored
// counts as not the same)
export function shouldReportTimeZone(stored: string | null | undefined, browser: string): boolean {
  return browser.length > 0 && browser !== stored
}
