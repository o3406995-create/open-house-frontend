export const SAVEDPROPERTIES_CONSTANTS = {
  PAGE_TITLE: "Saved Properties",
  PAGE_SUBTITLE: "Properties you're following and their upcoming open houses.",

  PAGE_SIZE: 10,
  // The backend returns at most 50 per page. The details page asks for that many to find
  // out whether one property is already saved.
  LOOKUP_PAGE_SIZE: 50,

  STATUS_UNAUTHORIZED: 401,
  STATUS_FORBIDDEN: 403,

  LIST_LABEL: "Saved properties",
  LOADING_LABEL: "Loading saved properties",

  EMPTY_TITLE: "No saved properties yet",
  EMPTY_BODY: "Save a property from its details page and it will show up here.",
  EMPTY_ACTION: "Search properties",

  ERROR_TITLE: "Could not load your saved properties",
  ERROR_BODY: "Please check your connection and try again.",
  RETRY: "Try again",
  LOGIN_REQUIRED_TITLE: "Log in to see your saved properties",
  LOGIN_ACTION: "Log in",
  USER_ONLY_TITLE: "Saved properties are for user accounts",
  USER_ONLY_BODY: "Agent and admin accounts cannot save properties.",

  VIEW_DETAILS: "View Details",
  REMOVE: "Remove",
  REMOVING: "Removing...",
  REMOVE_LABEL: (address: string) => `Remove ${address} from saved properties`,
  REMOVE_ERROR: "Could not remove that property. Please try again.",

  TODAY: "Today",
  NO_UPCOMING_OPEN_HOUSE: "No upcoming open house",
  MORE_OPEN_HOUSES: (count: number) => `+${count} more`,
  NO_LONGER_LISTED: "No longer listed",
  MAY_BE_OUT_OF_DATE: "Details may be out of date",

  // Values of listingStatus returned by the backend
  LISTING_STATUS_REMOVED: "REMOVED",
  LISTING_STATUS_UNKNOWN: "UNKNOWN",

  BEDROOMS: "bedrooms",
  BATHROOMS: "bathrooms",
  CAR_SPACES: "car spaces",

  PREVIOUS: "Previous",
  NEXT: "Next",
  PAGINATION_LABEL: "Saved properties pages",
  PAGE_RANGE: (from: number, to: number, total: number) => `${from}-${to} of ${total}`,

  SAVED: "Saved",
  SAVED_HINT: "Remove from saved properties",
  SAVE_ERROR: "Could not update your saved properties. Please try again.",

  PROPERTY_ROUTE: (externalId: string) => `/properties/${encodeURIComponent(externalId)}`,
}