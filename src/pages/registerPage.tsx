import { useForm } from "react-hook-form"
import { useNavigate, Link } from "react-router-dom"
import { Home, User, Mail, Lock } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { SocialButton } from "@/utils/SocialButton"
import { GoogleIcon, AppleIcon } from "@/utils/icons"
import { registerPageConstants as C } from "@/common/constants"
import { authApi } from "@/api/auth"
import { ApiError } from "@/api/client"
import { getApiErrorMessage } from "@/api/errors"
import type { ApiValidationError } from "@/api/types"
import { useAppDispatch } from "@/store/hooks"
import { setUser } from "@/store/authSlice"
import { useState } from "react"

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface RegisterFormValues {
  name: string
  email: string
  password: string
  confirmPassword: string
}

function getServerFieldErrors(err: unknown): Partial<Record<keyof RegisterFormValues, string>> {
  if (!(err instanceof ApiError) || err.status !== 400) return {}

  const errors = (err.data as ApiValidationError | null)?.errors
  if (!errors) return {}

  const result: Partial<Record<keyof RegisterFormValues, string>> = {}
  for (const key of ["name", "email", "password"] as const) {
    const message = errors[key]?.[0]
    if (message) result[key] = message
  }
  return result
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [error, setError] = useState("")

  const {
    register,
    handleSubmit,
    watch,
    setError: setFieldError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>()

  const password = watch("password")

  const onSubmit = async (data: RegisterFormValues) => {
    setError("")

    try {
      const { user } = await authApi.register({
        name: data.name.trim(),
        email: data.email.trim(),
        password: data.password,
      })

      dispatch(setUser(user))
      navigate("/")
    } catch (err: unknown) {
      const serverErrors = getServerFieldErrors(err)
      if (Object.keys(serverErrors).length > 0) {
        for (const [field, message] of Object.entries(serverErrors)) {
          setFieldError(field as keyof RegisterFormValues, { message })
        }
      } else {
        setError(getApiErrorMessage(err, C.REGISTER_FAILED))
      }
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="w-full max-w-sm">
        {/* Logo + title */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white">
            <Home className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-semibold text-slate-900">{C.TITLE}</h1>
          <p className="mt-2 text-sm text-slate-500">{C.HINT}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="space-y-4">
            {/* Name */}
            <div className="space-y-1">
              <Label htmlFor="name" className="sr-only">
                Full name
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Full name"
                  className="pl-9"
                  autoComplete="name"
                  aria-invalid={!!errors.name}
                  {...register("name", { required: C.NAME_REQUIRED })}
                />
              </div>
              {errors.name && (
                <p className="text-xs text-red-600">{errors.name.message}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1">
              <Label htmlFor="email" className="sr-only">
                Email address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Email address"
                  className="pl-9"
                  autoComplete="email"
                  aria-invalid={!!errors.email}
                  {...register("email", {
                    required: C.EMAIL_REQUIRED,
                    pattern: { value: EMAIL_REGEX, message: C.EMAIL_INVALID },
                  })}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1">
              <Label htmlFor="password" className="sr-only">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Password (min 8 characters)"
                  className="pl-9"
                  autoComplete="new-password"
                  aria-invalid={!!errors.password}
                  {...register("password", {
                    minLength: { value: C.PASSWORD_MIN_LENGTH, message: C.PASSWORD_MIN },
                  })}
                />
              </div>
              {errors.password && (
                <p className="text-xs text-red-600">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm password */}
            <div className="space-y-1">
              <Label htmlFor="confirmPassword" className="sr-only">
                Confirm password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm password"
                  className="pl-9"
                  autoComplete="new-password"
                  aria-invalid={!!errors.confirmPassword}
                  {...register("confirmPassword", {
                    validate: (value) => value === password || C.PASSWORD_MISMATCH,
                  })}
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-red-600">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
          </div>

          {/* General error */}
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

          {/* Sign Up button */}
          <div className="mt-6">
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? C.LOADING : C.SUBMIT}
            </Button>
          </div>
        </form>

        {/* Sign in link */}
        <p className="mt-5 text-center text-sm text-slate-500">
          {C.HAVE_ACCOUNT}{" "}
          <Link
            to="/login"
            className="font-medium text-blue-600 hover:underline"
          >
            {C.SIGN_IN}
          </Link>
        </p>

        {/* Divider */}
        <div className="my-5 flex items-center gap-4">
          <div className="h-px flex-1 bg-slate-200" />
          <span className="text-sm text-slate-400">or</span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        {/* Social sign up */}
        <div className="space-y-3">
          <SocialButton
            icon={<GoogleIcon />}
            text="Sign up with Google"
            onClick={() => console.log("Google sign up")}
          />
          <SocialButton
            icon={<AppleIcon />}
            text="Sign up with Apple"
            onClick={() => console.log("Apple sign up")}
          />
        </div>
      </div>
    </div>
  )
}