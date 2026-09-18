import axios from "axios"
import { loginPageConstants } from "@/common/constants"

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"

export const apiClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(loginPageConstants.AUTH_TOKEN_KEY)

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      localStorage.removeItem(loginPageConstants.AUTH_TOKEN_KEY)
      localStorage.removeItem(loginPageConstants.USER_KEY)
    }
    return Promise.reject(error)
  },
)