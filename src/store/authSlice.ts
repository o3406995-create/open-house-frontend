import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { User } from "@/api/types"
import { authApi } from "./authApi"

interface AuthState {
  user: User | null
}

const initialState: AuthState = {
  user: null,
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload
    },
    clearUser: (state) => {
      state.user = null
    },
    // The time zone the server stored for the user, so that nothing asks for it again
    setUserTimeZone: (state, action: PayloadAction<string>) => {
      if (state.user) state.user.time_zone = action.payload
    },
  },
  extraReducers: (builder) => {
    // Stored in the same reducer pass as the response, so a route guard that sees the
    // query as finished always sees the user too (no render in between).
    builder.addMatcher(authApi.endpoints.getCurrentUser.matchFulfilled, (state, action) => {
      state.user = action.payload.user
    })
  },
})

export const { setUser, clearUser, setUserTimeZone } = authSlice.actions
export default authSlice.reducer
