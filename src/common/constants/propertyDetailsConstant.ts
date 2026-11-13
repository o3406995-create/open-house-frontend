export const PROPERTYDETAILS_CONSTANTS = {
  // Routing
  ROUTE_PATTERN: "properties/:externalId",
  PATH: (externalId: string) => `/properties/${encodeURIComponent(externalId)}`,
  INITIAL_LOCATION_KEY: "default",

  // Page states
  BACK_TO_SEARCH: "Back to search results",
  LOADING_LABEL: "Loading property",
  NOT_FOUND_TITLE: "Property not found",
  NOT_FOUND_BODY: "This listing may have been removed or the link is incorrect.",
  ERROR_TITLE: "Something went wrong",
  ERROR_BODY: "We couldn't load this property. Please try again.",
  RETRY: "Try again",

  // Gallery
  NO_PHOTOS: "No photos available",
  PREVIOUS_PHOTO: "Previous photo",
  NEXT_PHOTO: "Next photo",
  IMAGE_COUNTER: (current: number, total: number) => `${current} / ${total}`,
  IMAGE_ALT: (address: string, index: number) => `${address}, photo ${index}`,
  THUMBNAIL_LABEL: (index: number) => `Show photo ${index}`,

  // Summary
  BEDROOMS_LABEL: (count: number) => `${count} ${count === 1 ? "bedroom" : "bedrooms"}`,
  BATHROOMS_LABEL: (count: number) => `${count} ${count === 1 ? "bathroom" : "bathrooms"}`,
  CAR_SPACES_LABEL: (count: number) => `${count} ${count === 1 ? "car space" : "car spaces"}`,
  CONTACT_AGENT: "Contact Agent",

  // Open houses
  UPCOMING_OPEN_HOUSES: "Upcoming Open Houses",
  NO_UPCOMING: "No upcoming open houses.",
  CANCELLED: "Cancelled",
  OPEN_HOUSE_STATUS_SCHEDULED: "SCHEDULED",
  TIME_RANGE: (start: string, end: string) => `${start} – ${end}`,
  VIEW_DETAILS: "View details",
  NEXT_OPEN_HOUSE: "Open house",

  // Agent
  LISTING_AGENT: "Listing Agent",
  VIEW_AGENT_PROFILE: "View Agent Profile",
  AGENT_PHOTO_ALT: (name: string) => `Photo of ${name}`,
  INITIALS_MAX: 2,

  // Actions
  ADD_OPEN_HOUSE: "Add this Open House",
  SAVE_PROPERTY: "Save Property",
  OPEN_EXTERNAL: "Open External Listing",
  COMING_SOON: "Coming soon",
  ROLE_USER: "USER",

  // Description
  PROPERTY_DETAILS: "Property Details",
  PROPERTY_TYPE: "Property Type",
  LAND_SIZE: "Land Size",
  LAND_SIZE_UNIT: "m²",

  // Formatting and validation
  LOCALE: "en-AU",
  EMAIL_PATTERN: /^[^\s@?&#<>]+@[^\s@?&#<>]+\.[^\s@?&#<>]+$/,
  PHONE_PATTERN: /^[0-9+()\-\s]{6,20}$/,
  PHONE_STRIP_PATTERN: /[^\d+]/g,
}