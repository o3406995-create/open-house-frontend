import { configureStore } from "@reduxjs/toolkit"
import authReducer from "./authSlice"
import { authApi } from "./authApi"
import { propertiesApi } from "./propertiesApi"

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [propertiesApi.reducerPath]: propertiesApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApi.middleware, propertiesApi.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch