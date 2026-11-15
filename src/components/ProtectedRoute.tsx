import type { ReactNode } from "react"
import { Navigate, useLocation } from "react-router-dom"
import { useAppSelector } from "@/store/hooks"
import { useGetCurrentUserQuery } from "@/store/authApi"
import { loginPageConstants } from "@/common/constants"

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const location = useLocation()
  const user = useAppSelector((state) => state.auth.user)
  const { isLoading, isUninitialized } = useGetCurrentUserQuery()

  if (isLoading || isUninitialized) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-slate-400">
        Loading...
      </div>
    )
  }

  if (!user) {
    return (
      <Navigate
        to={loginPageConstants.LOGIN_ROUTE}
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    )
  }

  return <>{children}</>
}