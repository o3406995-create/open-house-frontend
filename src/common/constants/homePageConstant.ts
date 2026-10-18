export const HOMEPAGE_CONSTANTS = {
  // Hero section
  HERO_TITLE_LINE_1: "Find Your Next",
  HERO_TITLE_LINE_2: "Open House",
  HERO_SUBTITLE:
    "Explore properties, attend open inspections and connect with local real estate agents.",

  // Search bar
  ADDRESS_PLACEHOLDER: "Address, suburb or postcode",
  SEARCH_BUTTON: "Search",
  SEARCHING: "Searching...",

  // Search validation
  SEARCH_ERROR_EMPTY: "Please enter an address, suburb or postcode.",
  SEARCH_ERROR_TOO_SHORT: "Please enter at least 3 characters.",
  SEARCH_ERROR_INVALID_CHARS: "Address contains invalid characters.",
  MIN_ADDRESS_LENGTH: 3,
  SEARCH_BUTTON_WIDTH_PX: 110,

  // Radius options
  RADIUS_1KM: "Within 1 km",
  RADIUS_2KM: "Within 2 km",
  RADIUS_5KM: "Within 5 km",
  RADIUS_10KM: "Within 10 km",

  // Date range options
  DATE_ANY: "Any date",
  DATE_TODAY: "Today",
  DATE_WEEKEND: "This weekend",
  DATE_WEEK: "This week",

  // Filter bar
  FILTER_PRICE: "Price",
  FILTER_BEDROOMS: "Bedrooms",
  FILTER_BATHROOMS: "Bathrooms",
  FILTER_PROPERTY_TYPE: "Property type",
  FILTER_AUCTION: "Auction",
  FILTER_MORE: "More filters",

  PRICE_UNDER_500K: "Under $500k",
  PRICE_500K_1M: "$500k - $1M",
  PRICE_OVER_1M: "$1M+",

  BEDROOMS_SUFFIX: "+ bedrooms",
  BATHROOMS_SUFFIX: "+ bathrooms",

  // Map placeholder
  MAP_COMING_SOON: "Map view coming soon",
  MAP_EMPTY_HINT: "Search to see properties on the map",
  MAP_RESULTS_FOUND: (count: number) => `${count} properties found nearby`,
  LEGEND_OPEN_HOUSE: "Open House",
  LEGEND_NO_OPEN_HOUSE: "Property, No upcoming OH",
  FIND_AGENTS_BUTTON: "Find Agents in This Area",

  // Search behavior
  MIN_LOADING_MS: 2000,

  SEARCH_DEBOUNCE_MS: 1000,

  // Map defaults
  DEFAULT_MAP_CENTER: { lat: -27.4698, lng: 153.0251 }, // Brisbane CBD
  DEFAULT_RADIUS_METERS: 5000,
  DEFAULT_MAP_ZOOM: 13,

  // Map marker/circle colors
  MAP_COLOR_OPEN_HOUSE: "#ef4444",
  MAP_COLOR_NO_OPEN_HOUSE: "#3b82f6",
  MAP_COLOR_RADIUS_CIRCLE: "#3b82f6",
}