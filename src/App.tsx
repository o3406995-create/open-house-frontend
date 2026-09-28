import { useEffect } from 'react'
import { Link, Outlet } from 'react-router-dom'
import { useGetCurrentUserQuery } from '@/store/authApi'
import { useAppDispatch } from '@/store/hooks'
import { setUser } from '@/store/authSlice'
import './App.css'

function App() {
  const dispatch = useAppDispatch()
  const { data, isSuccess } = useGetCurrentUserQuery()

  useEffect(() => {
    if (isSuccess && data) {
      dispatch(setUser(data.user))
    }
  }, [isSuccess, data, dispatch])

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="text-xl font-semibold">Open House</div>
          <nav className="flex gap-3">
            <Link
              to="/"
              className="rounded-full px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Home
            </Link>
            <Link
              to="/contact-us"
              className="rounded-full px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Contact Us
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <Outlet />
      </main>
    </div>
  )
}

export default App