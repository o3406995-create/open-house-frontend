export interface User {
  user_id: number
  name: string
  email: string
  role: string
  status: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  user: User
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
}

export interface RegisterResponse {
  user: User
}

export interface ApiValidationError {
  message: string
  errors?: Record<string, string[] | undefined>
}

export interface ApiError {
  message: string
}