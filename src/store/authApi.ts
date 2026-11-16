import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import type { User } from "@/api/types"
import { API_BASE_URL } from "@/config/apiBaseUrl"

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    credentials: "include",
  }),
  endpoints: (builder) => ({
    getCurrentUser: builder.query<{ user: User }, void>({
      query: () => "/users/me",
    }),
  }),
})

export const { useGetCurrentUserQuery } = authApi