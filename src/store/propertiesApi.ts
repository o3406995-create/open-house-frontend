import { API_BASE_URL } from "@/config/apiBaseUrl"
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { myOpenHousesConstants as M } from "@/common/constants"
import { tagsToInvalidate } from "@/utils/myOpenHouses"

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

// The four groups of My Open Houses. The backend works them out when the list is read.
export type MyOpenHouseGroup = "today" | "upcoming" | "attended" | "expired"

export type MyOpenHouseCountsDTO = Record<MyOpenHouseGroup, number>

// An entry as the list endpoint returns it. The property is the snapshot stored when the
// open house was added, so it has no thumbnail and no open houses of its own.
export interface MyOpenHouseItemDTO {
  myOpenHouseId: number
  addedAt: string
  attended: boolean
  group: MyOpenHouseGroup
  openHouse: OpenHouseDTO
  property: PropertySummaryDTO
}

export interface MyOpenHousesDTO {
  timeZone: string
  counts: MyOpenHouseCountsDTO
  myOpenHouses: Record<MyOpenHouseGroup, MyOpenHouseItemDTO[]>
}

export type UserOpenHouseStatus = "UPCOMING" | "ATTENDED" | "EXPIRED"

// What adding returns. It has a status instead of a group; adding the same open house again
// returns the existing entry.
export interface AddedMyOpenHouseDTO {
  myOpenHouseId: number
  addedAt: string
  status: UserOpenHouseStatus
  openHouse: OpenHouseDTO
  property: PropertySummaryDTO
}

export interface AddMyOpenHouseParams {
  propertyExternalId: string
  openHouseExternalId: string
}

const baseUrl = API_BASE_URL

const SAVED_PROPERTIES_TAG = "SavedProperties"

export const propertiesApi = createApi({
  reducerPath: "propertiesApi",
  baseQuery: fetchBaseQuery({
    baseUrl,
    credentials: "include",
  }),
  tagTypes: [SAVED_PROPERTIES_TAG, M.API_TAG],
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

    // The argument is the time zone of the browser. params encodes it (a "/" becomes %2F).
    getMyOpenHouses: builder.query<MyOpenHousesDTO, string>({
      query: (timeZone) => ({
        url: "/my-open-houses",
        params: { timeZone },
      }),
      providesTags: [M.API_TAG],
    }),

    addMyOpenHouse: builder.mutation<AddedMyOpenHouseDTO, AddMyOpenHouseParams>({
      query: (body) => ({
        url: "/my-open-houses",
        method: "POST",
        body,
      }),
      transformResponse: (response: { myOpenHouse: AddedMyOpenHouseDTO }) =>
        response.myOpenHouse,
      invalidatesTags: [M.API_TAG],
    }),

    // A 404 means the entry is gone already, so the list is refreshed then as well
    removeMyOpenHouse: builder.mutation<void, number>({
      query: (myOpenHouseId) => ({
        url: `/my-open-houses/${myOpenHouseId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, error) => tagsToInvalidate(error),
    }),

    // A 409 (not started yet) changes nothing; a 404 means the entry is gone
    markMyOpenHouseAttended: builder.mutation<MyOpenHouseItemDTO, number>({
      query: (myOpenHouseId) => ({
        url: `/my-open-houses/${myOpenHouseId}/attended`,
        method: "PATCH",
      }),
      transformResponse: (response: { myOpenHouse: MyOpenHouseItemDTO }) =>
        response.myOpenHouse,
      invalidatesTags: (_result, error) => tagsToInvalidate(error),
    }),
  }),
})

export const {
  useSearchPropertiesMutation,
  useGetPropertyByIdQuery,
  useGetSavedPropertiesQuery,
  useSavePropertyMutation,
  useRemoveSavedPropertyMutation,
  useGetMyOpenHousesQuery,
  useAddMyOpenHouseMutation,
  useRemoveMyOpenHouseMutation,
  useMarkMyOpenHouseAttendedMutation,
} = propertiesApi
