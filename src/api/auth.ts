import { apiClient } from "./client"
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from "./types"

export const authApi = {
  login: (payload: LoginRequest): Promise<LoginResponse> =>
    apiClient.post<LoginResponse>("/auth/login", payload),

  register: (payload: RegisterRequest): Promise<RegisterResponse> =>
    apiClient.post<RegisterResponse>("/auth/register", payload),

  logout: (): Promise<{ message: string }> =>
    apiClient.post<{ message: string }>("/auth/logout"),
}