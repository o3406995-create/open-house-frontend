export const NOTIFICATIONS_CONSTANTS = {
  ROUTE: "/notifications",

  // Only these accounts have notifications. The others never ask for them (the server answers 403).
  ROLES: ["USER"] as readonly string[],

  PAGE_SIZE: 20,
  // How often the number on the bell is asked for again
  POLL_INTERVAL_MS: 60_000,

  // The cache tag that every request about notifications shares
  API_TAG: "Notifications" as const,

  STATUS_NOT_FOUND: 404,

  PAGE_TITLE: "Notifications",
  PAGE_SUBTITLE: "Reminders and news about the open houses you follow.",

  LIST_LABEL: "Notifications",
  LOADING_LABEL: "Loading your notifications",

  EMPTY_TITLE: "No notifications yet",
  EMPTY_BODY:
    "When a property you saved gets a new open house, or an open house you added is coming up, it will show up here.",
  ERROR_TITLE: "We could not load your notifications",
  ERROR_BODY: "Check your connection and try again.",
  RETRY: "Try again",

  UNREAD: "Unread",
  MARK_READ: "Mark as read",
  MARK_READ_LABEL: (message: string) => `Mark as read: ${message}`,
  MARK_READ_FAILED: "We could not mark it as read. Try again.",

  PREVIOUS: "Previous",
  NEXT: "Next",
  PAGE_STATUS: (from: number, to: number, total: number) => `Showing ${from}-${to} of ${total}`,

  BELL_LABEL: "Notifications",
  BELL_LABEL_UNREAD: (count: string) => `Notifications, ${count} unread`,
  // A number above this is shown as "99+", so it never outgrows the badge
  BADGE_MAX: 99,

  // What each type of notification is called. A type that is not here (the server may add one
  // before this page knows it) gets the general label and must never break the page.
  TYPE_LABELS: {
    NEW_OPEN_HOUSE: "New open house",
    OPEN_HOUSE_REMINDER: "Open house tomorrow",
    OPEN_HOUSE_TODAY: "Open house today",
    PRICE_CHANGE: "Price change",
    STATUS_CHANGE: "Status change",
  } as Record<string, string>,
  FALLBACK_LABEL: "Notification",

  // The route as a child of the app (see main.tsx)
  ROUTE_PATTERN: "notifications",

  PAGINATION_LABEL: "Notification pages",

  NOT_AVAILABLE_TITLE: "Notifications are not available for this account",
  NOT_AVAILABLE_BODY: "Notifications are sent to people who save properties and add open houses.",
}
