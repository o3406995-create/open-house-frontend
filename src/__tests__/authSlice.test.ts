import { describe, it, expect } from "@jest/globals"
import { configureStore } from "@reduxjs/toolkit"
import type { User } from "@/api/types"
import authReducer, { setUser, clearUser } from "@/store/authSlice"
import { authApi } from "@/store/authApi"

// A fixture: only the shape of a logged in user matters here
const user = {
  user_id: 1,
  name: "Test User",
  email: "test@example.com",
  phone: null,
  role: "USER",
  status: "ACTIVE",
  created_at: "2026-11-17T00:00:00.000Z",
  updated_at: "2026-11-17T00:00:00.000Z",
} as unknown as User

describe("authSlice", () => {
  it("starts without a user", () => {
    expect(authReducer(undefined, { type: "@@INIT" })).toEqual({ user: null })
  })

  it("stores the user with setUser", () => {
    expect(authReducer({ user: null }, setUser(user))).toEqual({ user })
  })

  it("removes the user with clearUser", () => {
    expect(authReducer({ user }, clearUser())).toEqual({ user: null })
  })

  it("stores the user in the same reducer pass when the current-user query succeeds", async () => {
    const store = configureStore({
      reducer: { auth: authReducer, [authApi.reducerPath]: authApi.reducer },
      middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(authApi.middleware),
    })

    // upsertQueryData runs the query machinery without a network call
    await store.dispatch(authApi.util.upsertQueryData("getCurrentUser", undefined, { user }))

    expect(store.getState().auth.user).toEqual(user)
  })
})
