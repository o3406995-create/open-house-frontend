import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Home, Mail, Lock } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { SocialButton } from "@/utils/SocialButton"
import { loginPageConstants } from "@/common/constants"
import { GoogleIcon, AppleIcon } from "@/utils/icons"
import { authApi } from "@/api/auth"
import { getApiErrorMessage } from "@/api/errors"

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = async () => {
    const trimmedEmail = email.trim()

    if (!trimmedEmail || !password.trim()) {
      setError(loginPageConstants.EMPTY_FIELDS)
      return
    }

    try {
      setIsLoading(true)
      setError("")

      const { user } = await authApi.login({
        email: trimmedEmail,
        password,
      })
 
      localStorage.setItem(loginPageConstants.USER_KEY, JSON.stringify(user))
 
      navigate("/")
   
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, loginPageConstants.LOGIN_FAILED))
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
          <h1 className="text-2xl font-semibold text-slate-900">
            {loginPageConstants.WELCOME_MESSAGE}
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {loginPageConstants.SIGN_HINT}
          </p>
        </div>

        {/* Email / Password inputs */}
        <div className="space-y-4">
          <div className="space-y-2">
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="sr-only">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                id="password"
                type="password"
                placeholder="Password"
                className="pl-9"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Remember me + Forgot password */}
        <div className="mt-4 flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-shadow-slate-600">
            <Checkbox id="remember" />
            {loginPageConstants.REMEMBER}
          </label>
          <Link
            to="/forgot-password"
            className="font-medium text-blue-600 hover:underline"
          >
            {loginPageConstants.FORGET}
          </Link>
        </div>

        {/* Error message */}
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        {/* Sign In button */}
        <div className="mt-6">
          <Button
            className="w-full bg-blue-600 hover:bg-blue-700"
            onClick={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? loginPageConstants.LOADING : loginPageConstants.SIGN_IN}
          </Button>
        </div>

        {/* Sign up link */}
        <p className="mt-5 text-center text-sm text-slate-500">
          Don&apos;t have an account?{" "}
          <Link
            to="/register"
            className="font-medium text-blue-600 hover:underline"
          >
            {loginPageConstants.SIGN_UP}
          </Link>
        </p>

        {/* Divider */}
        <div className="my-5 flex items-center gap-4">
          <div className="h-px flex-1 bg-slate-200" />
          <span className="text-sm text-slate-400">or</span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        {/* Social login */}
        <div className="space-y-3">
          <SocialButton
            icon={<GoogleIcon />}
            text="Continue with Google"
            onClick={() => console.log("Google sign in")}
          />
          <SocialButton
            icon={<AppleIcon />}
            text="Continue with Apple"
            onClick={() => console.log("Apple sign in")}
          />
        </div>
      </div>
    </div>
  )
}