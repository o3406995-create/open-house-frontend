import { notificationsConstants as N } from "@/common/constants"
import { errorStatus } from "@/utils/errorStatus"

// Only some kinds of account have notifications; the others must not ask for them
export function canSeeNotifications(role: string | null | undefined): boolean {
  return typeof role === "string" && N.ROLES.includes(role)
}

const hasOwn = (object: object, key: string) => Object.prototype.hasOwnProperty.call(object, key)

// The name of a type of notification. Only the names written down count: a type such as
// "constructor" must not find something on the prototype of the object.
export function labelOf(type: string): string {
  return hasOwn(N.TYPE_LABELS, type) ? (N.TYPE_LABELS[type] ?? N.FALLBACK_LABEL) : N.FALLBACK_LABEL
}

// The number on the bell: nothing for none, and a cap so it never outgrows the badge
export function badgeText(unread: number): string | null {
  if (!Number.isFinite(unread) || unread <= 0) return null
  return unread > N.BADGE_MAX ? `${N.BADGE_MAX}+` : String(Math.floor(unread))
}

// What a screen reader says for the bell
export function bellLabel(unread: number): string {
  const text = badgeText(unread)
  return text === null ? N.BELL_LABEL : N.BELL_LABEL_UNREAD(text)
}

// What the list is asked with. The bell asks for the first page with the same arguments, so that
// the two share one answer and one request a minute, and never disagree.
export function notificationsParams(page: number) {
  return { page, pageSize: N.PAGE_SIZE }
}

export function totalPagesOf(total: number, pageSize: number): number {
  return Math.max(1, Math.ceil(total / pageSize))
}

// Marking as read changes something when it worked, and when the notification was gone already
// (404), so the list is asked for again then. Any other failure changes nothing.
export function shouldRefreshAfterRead(error: unknown): boolean {
  return error === undefined || error === null || errorStatus(error) === N.STATUS_NOT_FOUND
}
