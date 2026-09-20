import { useState, type FormEvent } from "react"
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

type FieldName = "name" | "email" | "password" | "confirmPassword"
type FieldErrors = Partial<Record<FieldName, string>>

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function getServerFieldErrors(err: unknown): FieldErrors {
  if (!(err instanceof ApiError) || err.status !== 400) return {}

  const errors = (err.data as ApiValidationError | null)?.errors
  if (!errors) return {}

  const result: FieldErrors = {}
  for (const key of ["name", "email", "password"] as const) {
    const message = errors[key]?.[0]
    if (message) result[key] = message
  }
  return result
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const validate = (): FieldErrors => {
    const errors: FieldErrors = {}
    const trimmedEmail = email.trim()

    if (!name.trim()) errors.name = C.NAME_REQUIRED

    if (!trimmedEmail) errors.email = C.EMAIL_REQUIRED
    else if (!EMAIL_REGEX.test(trimmedEmail)) errors.email = C.EMAIL_INVALID

    if (password.length < C.PASSWORD_MIN_LENGTH) errors.password = C.PASSWORD_MIN

    if (confirmPassword !== password) errors.confirmPassword = C.PASSWORD_MISMATCH

    return errors
  }

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault()

    const errors = validate()
    setFieldErrors(errors)
    setError("")
    if (Object.keys(errors).length > 0) return

    try {
      setIsLoading(true)

      await authApi.register({
        name: name.trim(),
        email: email.trim(),
        password,
      })

      navigate("/login")
    } catch (err: unknown) {
      const serverErrors = getServerFieldErrors(err)
      if (Object.keys(serverErrors).length > 0) {
        setFieldErrors(serverErrors)
      } else {
        setError(getApiErrorMessage(err, C.REGISTER_FAILED))
      }
    } finally {
      setIsLoading(false)
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

        <form onSubmit={handleRegister} noValidate>
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
                  aria-invalid={!!fieldErrors.name}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              {fieldErrors.name && (
                <p className="text-xs text-red-600">{fieldErrors.name}</p>
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
                  aria-invalid={!!fieldErrors.email}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              {fieldErrors.email && (
                <p className="text-xs text-red-600">{fieldErrors.email}</p>
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
                  aria-invalid={!!fieldErrors.password}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {fieldErrors.password && (
                <p className="text-xs text-red-600">{fieldErrors.password}</p>
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
                  aria-invalid={!!fieldErrors.confirmPassword}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              {fieldErrors.confirmPassword && (
                <p className="text-xs text-red-600">
                  {fieldErrors.confirmPassword}
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
              disabled={isLoading}
            >
              {isLoading ? C.LOADING : C.SUBMIT}
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