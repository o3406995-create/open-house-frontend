import { useEffect } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Home } from 'lucide-react'
import { useGetCurrentUserQuery } from '@/store/authApi'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { setUser, clearUser } from '@/store/authSlice'
import { Button } from '@/components/ui/button'
import { authApi } from '@/api/auth'
import { navbarConstants as C } from '@/common/constants'
import './App.css'

const NAV_ITEMS = [
  { to: '/', label: C.NAV_SEARCH, end: true },
  { to: '/agents', label: C.NAV_FIND_AGENTS, end: false },
  { to: '/my-open-houses', label: C.NAV_MY_OPEN_HOUSES, end: false },
  { to: '/saved-properties', label: C.NAV_SAVED_PROPERTIES, end: false },
]

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
        <div className="relative flex items-center justify-between px-6 py-2">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white">
              <Home className="h-4 w-4" />
            </div>
            <span className="text-lg font-semibold">{C.BRAND_NAME}</span>
          </Link>

          <nav className="absolute left-1/2 hidden w-[500px] max-w-[90vw] -translate-x-1/2 items-center justify-between sm:flex lg:w-[650px] xl:w-[800px]">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `w-16 whitespace-normal break-words text-center text-sm font-medium leading-tight transition lg:w-24 xl:w-auto xl:whitespace-nowrap ${
                    isActive ? 'text-blue-600' : 'text-slate-600 hover:text-slate-900'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <span className="text-sm font-medium text-slate-700">
                  {C.GREETING(user.name)}
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
                >
                  {C.LOGOUT}
                </button>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" onClick={() => navigate('/login')}>
                  {C.LOGIN}
                </Button>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => navigate('/register')}>
                  {C.SIGN_UP}
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