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
  STATUS_UNAUTHORIZED: 401,
  STATUS_FORBIDDEN: 403,
  STATUS_NOT_FOUND: 404,
  STATUS_NOT_STARTED: 409,

  PAGE_TITLE: "My Open Houses",
  PAGE_SUBTITLE: "Manage your upcoming, attended and past open houses.",

  VIEW_TOGGLE_LABEL: "How to show your open houses",
  LIST_VIEW: "List View",
  MAP_VIEW: "Map View",

  TABS_LABEL: "Open house groups",
  TAB_ID: (tab: string) => `my-open-houses-tab-${tab}`,
  PANEL_ID: "my-open-houses-panel",
  GROUP_LABELS: {
    today: "Today",
    upcoming: "Upcoming",
    attended: "Attended",
    expired: "Expired",
  },
  TAB_LABEL: (label: string, count: number) => `${label} (${count})`,

  LIST_LABEL: "My open houses",
  LOADING_LABEL: "Loading your open houses",

  EMPTY_TITLES: {
    today: "No open houses today",
    upcoming: "No upcoming open houses",
    attended: "Nothing attended yet",
    expired: "No expired open houses",
  },
  EMPTY_BODIES: {
    today: "Open houses you add for today will show up here.",
    upcoming: "Add an open house from a property's details page and it will show up here.",
    attended: "Open houses you confirm that you attended will show up here.",
    expired: "Open houses that finished without being attended will show up here.",
  },
  // The groups for which the empty message offers a way to find open houses
  EMPTY_ACTION_GROUPS: ["today", "upcoming"] as const,
  EMPTY_ACTION: "Search properties",

  ERROR_TITLE: "Could not load your open houses",
  ERROR_BODY: "Please check your connection and try again.",
  RETRY: "Try again",
  LOGIN_REQUIRED_TITLE: "Log in to see your open houses",
  LOGIN_ACTION: "Log in",
  USER_ONLY_TITLE: "My Open Houses is for user accounts",
  USER_ONLY_BODY: "Agent and admin accounts cannot add open houses.",

  VIEW_DETAILS: "View Details",
  MARK_ATTENDED: "Mark as attended",
  MARKING: "Saving...",
  MARK_LABEL: (address: string) => `Mark ${address} as attended`,
  NOT_STARTED_HINT: "You can confirm once the open house has started.",
  REMOVE: "Remove",
  REMOVING: "Removing...",
  REMOVE_LABEL: (address: string) => `Remove ${address} from My Open Houses`,

  REMOVE_ERROR: "Could not remove that open house. Please try again.",
  MARK_ERROR: "Could not save that. Please try again.",
  NOT_STARTED_ERROR: "That open house has not started yet.",

  BEDROOMS: "bedrooms",
  BATHROOMS: "bathrooms",
  CAR_SPACES: "car spaces",
}
