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

const baseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000/api"

export const propertiesApi = createApi({
  reducerPath: "propertiesApi",
  baseQuery: fetchBaseQuery({
    baseUrl,
    credentials: "include",
  }),
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
  }),
})

export const { useSearchPropertiesMutation, useGetPropertyByIdQuery } = propertiesApi