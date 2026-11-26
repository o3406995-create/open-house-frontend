import { useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Home, Menu, X } from 'lucide-react'
import { useGetCurrentUserQuery } from '@/store/authApi'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { clearUser } from '@/store/authSlice'
import { propertiesApi } from '@/store/propertiesApi'
import { Button } from '@/components/ui/button'
import NavbarSearch from '@/components/navbarSearch'
import NotificationBell from '@/components/notifications/notificationBell'
import ContentLayout from '@/layouts/contentLayout'
import { authApi } from '@/api/auth'
import { navbarConstants as C, searchPageConstants as S } from '@/common/constants'
import './App.css'

const NAV_ITEMS = [
  { to: '/', label: C.NAV_SEARCH, end: true },
  { to: '/agents', label: C.NAV_FIND_AGENTS, end: false },
  { to: '/my-open-houses', label: C.NAV_MY_OPEN_HOUSES, end: false },
  { to: '/saved-properties', label: C.NAV_SAVED_PROPERTIES, end: false },
]

interface UserActionsProps {
  userName: string | null
  onLogout: () => void
  onLogin: () => void
  onSignUp: () => void
  // Called when the bell is followed, so that the mobile menu can close
  onNavigate?: (() => void) | undefined
}

function UserActions({ userName, onLogout, onLogin, onSignUp, onNavigate }: UserActionsProps) {
  if (userName) {
    return (
      <>
        <NotificationBell onNavigate={onNavigate} />
        <span className="text-sm font-medium text-slate-700">{C.GREETING(userName)}</span>
        <button
          type="button"
          onClick={onLogout}
          className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
        >
          {C.LOGOUT}
        </button>
      </>
    )
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={onLogin}>
        {C.LOGIN}
      </Button>
      <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={onSignUp}>
        {C.SIGN_UP}
      </Button>
    </>
  )
}

function App() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const user = useAppSelector((state) => state.auth.user)

  // Loads the current session; authSlice stores the user when this succeeds
  useGetCurrentUserQuery()

  // The mobile menu is open only for the location it was opened on, so navigating
  // anywhere closes it without needing an effect.
  const [openedAtKey, setOpenedAtKey] = useState<string | null>(null)
  const menuOpen = openedAtKey === location.key
  const closeMenu = () => setOpenedAtKey(null)
  const toggleMenu = () => setOpenedAtKey(menuOpen ? null : location.key)

  const handleLogout = async () => {
    closeMenu()
    try {
      await authApi.logout()
    } catch {
      // Even if the backend call fails, still clear local state so the user can log out
    }
    dispatch(clearUser())
    // Cached per-user data must not outlive the session
    dispatch(propertiesApi.util.resetApiState())
    navigate('/')
  }

  // The search page has its own search bar and is designed edge to edge
  const isSearchPage = location.pathname === S.SEARCH_ROUTE
  const showNavbarSearch = Boolean(user) && !isSearchPage
  const userName = user?.name ?? null

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-xl">
        <div className="flex items-center justify-between px-6 py-2 md:grid md:grid-cols-[1fr_auto_1fr]">
          <Link to="/" className="flex items-center gap-2 justify-self-start">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white">
              <Home className="h-4 w-4" />
            </div>
            <span className="text-lg font-semibold">{C.BRAND_NAME}</span>
          </Link>

          <nav
            aria-label={C.MOBILE_NAV_LABEL}
            className="hidden items-center justify-between md:flex md:w-[360px] lg:w-[650px] xl:w-[800px]"
          >
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

          <div className="hidden items-center gap-3 justify-self-end md:flex">
            {showNavbarSearch && (
              <div className="hidden lg:block">
                <NavbarSearch />
              </div>
            )}
            <UserActions
              userName={userName}
              onLogout={handleLogout}
              onLogin={() => navigate('/login')}
              onSignUp={() => navigate('/register')}
            />
          </div>

          <button
            type="button"
            onClick={toggleMenu}
            aria-label={menuOpen ? C.MENU_CLOSE_LABEL : C.MENU_OPEN_LABEL}
            aria-expanded={menuOpen}
            aria-controls={C.MOBILE_MENU_ID}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
          >
            {menuOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>

        {menuOpen && (
          <div id={C.MOBILE_MENU_ID} className="border-t border-slate-200 px-6 py-3 md:hidden">
            <nav aria-label={C.MOBILE_NAV_LABEL}>
              <ul className="space-y-1">
                {NAV_ITEMS.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end={item.end}
                      onClick={closeMenu}
                      className={({ isActive }) =>
                        `block rounded-lg px-3 py-2 text-sm font-medium ${
                          isActive
                            ? 'bg-blue-50 text-blue-600'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`
                      }
                    >
                      {item.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>

            {showNavbarSearch && (
              <div className="mt-3">
                <NavbarSearch inputClassName="w-full" />
              </div>
            )}

            <div className="mt-3 flex items-center gap-3 border-t border-slate-100 pt-3">
              <UserActions
                userName={userName}
                onLogout={handleLogout}
                onNavigate={closeMenu}
                onLogin={() => {
                  closeMenu()
                  navigate('/login')
                }}
                onSignUp={() => {
                  closeMenu()
                  navigate('/register')
                }}
              />
            </div>
          </div>
        )}
      </header>

      <main className="flex flex-1 flex-col">
        <ContentLayout fullBleed={isSearchPage}>
          <Outlet />
        </ContentLayout>
      </main>
    </div>
  )
}

export default App