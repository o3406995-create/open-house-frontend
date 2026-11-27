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

    // The browser tells which time zone it is on. The answer is the name the server stored.
    setTimeZone: builder.mutation<{ timeZone: string }, string>({
      query: (timeZone) => ({
        url: "/users/me/time-zone",
        method: "PUT",
        body: { timeZone },
      }),
    }),
  }),
})

export const { useGetCurrentUserQuery, useSetTimeZoneMutation } = authApi