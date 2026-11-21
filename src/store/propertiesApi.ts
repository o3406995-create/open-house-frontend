import { API_BASE_URL } from "@/config/apiBaseUrl"
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

export interface OpenHouseDTO {
  externalId: string
  startDatetime: string
  endDatetime: string
  status: "SCHEDULED" | "CANCELLED" | "COMPLETED"
}

export interface AgentDTO {
  name: string
  agencyName: string | null
  phone: string | null
  email: string | null
  photoUrl: string | null
}

// Returned by search
export interface PropertySummaryDTO {
  externalId: string
  source: "domain" | "mock"
  address: string
  suburb: string
  state: string
  postcode: string
  price: number | null
  displayPrice: string
  bedrooms: number
  bathrooms: number
  carSpaces: number | null
  propertyType: string
  latitude: number | null
  longitude: number | null
  thumbnailUrl: string | null
  openHouses: OpenHouseDTO[]
}

// Returned by the details endpoint
export interface PropertyDetailDTO extends PropertySummaryDTO {
  landSizeSqm: number | null
  description: string | null
  listingUrl: string | null
  images: string[]
  agent: AgentDTO | null
}

export interface PropertySearchParams {
  latitude: number
  longitude: number
  radiusMeters: number
  startDate?: string
  endDate?: string
  minPrice?: number
  maxPrice?: number
  minBedrooms?: number
  maxBedrooms?: number
  minBathrooms?: number
  maxBathrooms?: number
  propertyType?: string
  auctionOnly?: boolean
}

// AVAILABLE: fresh data. REMOVED: the data source no longer has the listing (stored snapshot).
// UNKNOWN: it could not be checked (stored snapshot).
export type ListingStatus = "AVAILABLE" | "REMOVED" | "UNKNOWN"

// A saved property as the list endpoint returns it
export interface SavedPropertyDTO {
  savedPropertyId: number
  savedAt: string
  listingStatus: ListingStatus
  property: PropertySummaryDTO
}

export interface SavedPropertiesPageDTO {
  savedProperties: SavedPropertyDTO[]
  total: number
  page: number
  pageSize: number
}

export interface SavedPropertiesParams {
  page: number
  pageSize: number
}

// Returned when saving; saving the same property again returns the existing record
export interface SavedPropertyResultDTO {
  savedPropertyId: number
  savedAt: string
  property: PropertySummaryDTO
}

const baseUrl = API_BASE_URL

const SAVED_PROPERTIES_TAG = "SavedProperties"

export const propertiesApi = createApi({
  reducerPath: "propertiesApi",
  baseQuery: fetchBaseQuery({
    baseUrl,
    credentials: "include",
  }),
  tagTypes: [SAVED_PROPERTIES_TAG],
  endpoints: (builder) => ({
    searchProperties: builder.mutation<PropertySummaryDTO[], PropertySearchParams>({
      query: (params) => ({
        url: "/properties/search",
        method: "POST",
        body: params,
      }),
      transformResponse: (response: { properties: PropertySummaryDTO[] }) => response.properties,
    }),

    getPropertyById: builder.query<PropertyDetailDTO, string>({
      query: (externalId) => `/properties/${encodeURIComponent(externalId)}`,
      transformResponse: (response: { property: PropertyDetailDTO }) => response.property,
    }),

    getSavedProperties: builder.query<SavedPropertiesPageDTO, SavedPropertiesParams>({
      query: ({ page, pageSize }) => ({
        url: "/saved-properties",
        params: { page, pageSize },
      }),
      providesTags: [SAVED_PROPERTIES_TAG],
    }),

    saveProperty: builder.mutation<SavedPropertyResultDTO, string>({
      query: (externalId) => ({
        url: "/saved-properties",
        method: "POST",
        body: { externalId },
      }),
      transformResponse: (response: { savedProperty: SavedPropertyResultDTO }) =>
        response.savedProperty,
      invalidatesTags: [SAVED_PROPERTIES_TAG],
    }),

    removeSavedProperty: builder.mutation<void, number>({
      query: (savedPropertyId) => ({
        url: `/saved-properties/${savedPropertyId}`,
        method: "DELETE",
      }),
      invalidatesTags: [SAVED_PROPERTIES_TAG],
    }),
  }),
})

export const {
  useSearchPropertiesMutation,
  useGetPropertyByIdQuery,
  useGetSavedPropertiesQuery,
  useSavePropertyMutation,
  useRemoveSavedPropertyMutation,
} = propertiesApi