import { apiClient } from "./client"
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from "./types"

export const authApi = {
  login: (payload: LoginRequest): Promise<LoginResponse> =>
    apiClient.post<LoginResponse>("/api/auth/login", payload),

  register: (payload: RegisterRequest): Promise<RegisterResponse> =>
    apiClient.post<RegisterResponse>("/api/auth/register", payload),
}