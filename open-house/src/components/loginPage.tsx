import { useState } from 'react'
import { InputField } from '../utils/InputField'
import { PrimaryButton } from '../utils/primaryButton'
import { SocialButton } from '../utils/SocialButton'

const LoginPage = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white">
            🏠
          </div>

          <h1 className="text-2xl font-semibold text-slate-900">
            Welcome Back
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Sign in to your account
          </p>
        </div>

        <div className="space-y-4">
            <InputField
              type="email"
              placeholder="Email"
              value={email}
              onChange={setEmail}
            />
            <InputField
              type="password"
              placeholder="Password"
              value={password}
              onChange={setPassword}
            />
        </div>

        <div className="mt-4 flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-slate-600">
                <input
                type="checkbox"
                className="h-4 w-4"
                />

                Remember me
            </label>

            <a
                href="/forgot-password"
                className="font-medium text-blue-600 hover:underline"
            >
                Forgot password?
            </a>
        </div>

        <div className="mt-6">
            <PrimaryButton
                text="Sign In"
                onClick={() => {
                console.log(email, password)
                }}
            />
        </div>

        {/* Sign up */}
        <p className="mt-5 text-center text-sm text-slate-500">
        Don&apos;t have an account?{" "}
        <a
            href="/register"
            className="font-medium text-blue-600 hover:underline"
        >
            Sign up
        </a>
        </p>

        {/* Divider */}
        <div className="my-5 flex items-center gap-4">
        <div className="h-px flex-1 bg-slate-200" />

        <span className="text-sm text-slate-400">
            or
        </span>

        <div className="h-px flex-1 bg-slate-200" />
        </div>

        {/* Google button */}
        <div className="space-y-3">
            <SocialButton
                text="Continue with Google"
                icon={
                <span className="font-semibold text-blue-600">
                    G
                </span>
                }
                onClick={() => {
                console.log("Google sign in")
                }}
            />

            <SocialButton
                text="Continue with Apple"
                icon={
                <span className="text-lg">
                    
                </span>
                }
                onClick={() => {
                console.log("Apple sign in")
                }}
            />
            </div>

      </div>
    </div>
  )
}
export default LoginPage