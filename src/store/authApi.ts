import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import type { User } from "@/api/types"

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:3000/api",
    credentials: "include",
  }),
  endpoints: (builder) => ({
    getCurrentUser: builder.query<{ user: User }, void>({
      query: () => "/auth/me",
    }),
  }),
})

export const { useGetCurrentUserQuery } = authApi