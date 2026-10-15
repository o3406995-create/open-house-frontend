import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

export interface OpenHouseDTO {
  externalId: string
  startDatetime: string
  endDatetime: string
  status: "SCHEDULED" | "CANCELLED" | "COMPLETED"
}

export interface PropertyDTO {
  externalId: string
  source: string
  address: string
  suburb: string
  state: string
  postcode: string
  price: number | null
  displayPrice: string
  bedrooms: number
  bathrooms: number
  propertyType: string
  latitude: number | null
  longitude: number | null
  description: string | null
  listingUrl: string | null
  openHouses: OpenHouseDTO[]
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

const baseUrl = (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000/api")

export const propertiesApi = createApi({
  reducerPath: "propertiesApi",
  baseQuery: fetchBaseQuery({
    baseUrl,
    credentials: "include",
  }),
  endpoints: (builder) => ({
    searchProperties: builder.mutation<PropertyDTO[], PropertySearchParams>({
      query: (params) => ({
        url: "/properties/search",
        method: "POST",
        body: params,
      }),
      transformResponse: (response: { properties: PropertyDTO[] }) => response.properties,

    }),
  }),
})

export const { useSearchPropertiesMutation } = propertiesApi