import type { ReactNode } from "react"
import { Navigate } from "react-router-dom"
import { useAppSelector } from "@/store/hooks"
import { useGetCurrentUserQuery } from "@/store/authApi"

export default function ProtectedRoute({ children }: { children: ReactNode }) {
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
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}