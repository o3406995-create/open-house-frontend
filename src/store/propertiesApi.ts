import { API_BASE_URL } from "@/config/apiBaseUrl"
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { myOpenHousesConstants as M, notificationsConstants as N } from "@/common/constants"
import { tagsToInvalidate } from "@/utils/myOpenHouses"
import { shouldRefreshAfter } from "@/utils/notes"
import { shouldRefreshAfterRead } from "@/utils/notifications"

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

// The note of the user on an item of the saved properties list or of My Open Houses
export interface NoteSummaryDTO {
  noteId: number
  content: string
  updatedAt: string
}

// What creating or changing a note returns
export interface NoteDTO extends NoteSummaryDTO {
  savedPropertyId: number | null
  userOpenHouseId: number | null
  createdAt: string
}

// A note belongs to exactly one of a saved property and an entry in My Open Houses
export type CreateNoteParams =
  | { savedPropertyId: number; content: string }
  | { userOpenHouseId: number; content: string }

export interface UpdateNoteParams {
  noteId: number
  content: string
}

// AVAILABLE: fresh data. REMOVED: the data source no longer has the listing (stored snapshot).
// UNKNOWN: it could not be checked (stored snapshot).
export type ListingStatus = "AVAILABLE" | "REMOVED" | "UNKNOWN"

// A saved property as the list endpoint returns it
export interface SavedPropertyDTO {
  savedPropertyId: number
  savedAt: string
  listingStatus: ListingStatus
  // The note of the user on this saved property; missing or null when there is none
  note?: NoteSummaryDTO | null | undefined
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
  // The note of the user on this entry; missing or null when there is none
  note?: NoteSummaryDTO | null | undefined
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

// A notification as the list endpoint returns it. The type is a plain string on purpose: the
// server can add a type before this client knows it.
export interface NotificationDTO {
  notificationId: number
  type: string
  message: string
  isRead: boolean
  createdAt: string
  openHouse: OpenHouseDTO
  property: PropertySummaryDTO
}

export interface NotificationsPageDTO {
  notifications: NotificationDTO[]
  // How many there are in all, and how many of those are unread (not only on this page)
  total: number
  unreadCount: number
  page: number
  pageSize: number
}

export interface NotificationsParams {
  page: number
  pageSize: number
}

const baseUrl = API_BASE_URL

const SAVED_PROPERTIES_TAG = "SavedProperties"

// Both lists show the notes, so both are asked again after a change. A failure that changes
// nothing leaves them alone.
type NoteTag = typeof SAVED_PROPERTIES_TAG | typeof M.API_TAG

const noteTags = (error: unknown): NoteTag[] =>
  shouldRefreshAfter(error) ? [SAVED_PROPERTIES_TAG, M.API_TAG] : []

export const propertiesApi = createApi({
  reducerPath: "propertiesApi",
  baseQuery: fetchBaseQuery({
    baseUrl,
    credentials: "include",
  }),
  tagTypes: [SAVED_PROPERTIES_TAG, M.API_TAG, N.API_TAG],
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

    // Notes are shown inside the saved properties and My Open Houses lists
    createNote: builder.mutation<NoteDTO, CreateNoteParams>({
      query: (body) => ({
        url: "/notes",
        method: "POST",
        body,
      }),
      transformResponse: (response: { note: NoteDTO }) => response.note,
      invalidatesTags: (_result, error) => noteTags(error),
    }),

    updateNote: builder.mutation<NoteDTO, UpdateNoteParams>({
      query: ({ noteId, content }) => ({
        url: `/notes/${noteId}`,
        method: "PUT",
        body: { content },
      }),
      transformResponse: (response: { note: NoteDTO }) => response.note,
      invalidatesTags: (_result, error) => noteTags(error),
    }),

    deleteNote: builder.mutation<void, number>({
      query: (noteId) => ({
        url: `/notes/${noteId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, error) => noteTags(error),
    }),

    getNotifications: builder.query<NotificationsPageDTO, NotificationsParams>({
      query: ({ page, pageSize }) => ({
        url: "/notifications",
        params: { page, pageSize },
      }),
      providesTags: [N.API_TAG],
    }),

    // A 404 means the notification is gone already, so the list is asked for again then as well
    markNotificationRead: builder.mutation<NotificationDTO, number>({
      query: (notificationId) => ({
        url: `/notifications/${notificationId}/read`,
        method: "PATCH",
      }),
      transformResponse: (response: { notification: NotificationDTO }) => response.notification,
      invalidatesTags: (_result, error) => (shouldRefreshAfterRead(error) ? [N.API_TAG] : []),
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
  useCreateNoteMutation,
  useUpdateNoteMutation,
  useDeleteNoteMutation,
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
} = propertiesApi
