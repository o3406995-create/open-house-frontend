export const MYOPENHOUSES_CONSTANTS = {
  ROUTE: "/my-open-houses",

  // The groups the backend answers with, in the order of the tabs
  TABS: ["today", "upcoming", "attended", "expired"] as const,
  DEFAULT_TAB: "today" as const,
  TAB_PARAM: "tab",

  VIEWS: ["list", "map"] as const,
  DEFAULT_VIEW: "list" as const,
  VIEW_PARAM: "view",

  // Used when the browser does not report its time zone; the same as the backend default
  DEFAULT_TIME_ZONE: "Australia/Brisbane",

  // The cache tag that every request about My Open Houses shares
  API_TAG: "MyOpenHouses" as const,

  // What the backend answers with
  STATUS_NOT_FOUND: 404,
  STATUS_NOT_STARTED: 409,
}
