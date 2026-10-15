import { useEffect } from 'react'
import { Link, Outlet, useNavigate } from 'react-router-dom'
import { Home } from 'lucide-react'
import { useGetCurrentUserQuery } from '@/store/authApi'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { setUser, clearUser } from '@/store/authSlice'
import { Button } from '@/components/ui/button'
import { authApi } from '@/api/auth'
import './App.css'

function App() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const user = useAppSelector((state) => state.auth.user)
  const { data, isSuccess } = useGetCurrentUserQuery()

  useEffect(() => {
    if (isSuccess && data) {
      dispatch(setUser(data.user))
    }
  }, [isSuccess, data, dispatch])

  const handleLogout = async () => {
    try {
      await authApi.logout()
    } catch {
      // Even if the backend call fails, still clear local state so the user can log out
    }
    dispatch(clearUser())
    navigate('/')
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-xl">
        <div className="flex items-center justify-between px-6 py-2">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white">
                <Home className="h-4 w-4" />
              </div>
              <span className="text-lg font-semibold">Open House</span>
            </Link>

            <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 sm:flex">
              <Link to="/" className="text-blue-600">
                Search
              </Link>
              <Link to="/agents" className="transition hover:text-slate-900">
                Find Agents
              </Link>
              <Link to="/my-open-houses" className="transition hover:text-slate-900">
                My Open Houses
              </Link>
              <Link to="/saved-properties" className="transition hover:text-slate-900">
                Saved Properties
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-2">
            {user ? (
              <>
                <span className="text-sm font-medium text-slate-700">Hi, {user.name}</span>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  Log out
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" onClick={() => navigate('/login')}>
                  Log in
                </Button>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => navigate('/register')}>
                  Sign Up
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}

export default App