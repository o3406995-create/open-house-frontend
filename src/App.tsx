import { useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Home, Menu, X } from 'lucide-react'
import { useGetCurrentUserQuery } from '@/store/authApi'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { clearUser } from '@/store/authSlice'
import { Button } from '@/components/ui/button'
import NavbarSearch from '@/components/navbarSearch'
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

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `whitespace-nowrap text-sm font-medium transition ${
    isActive ? 'text-blue-600' : 'text-slate-600 hover:text-slate-900'
  }`

function App() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const user = useAppSelector((state) => state.auth.user)
  // Below the md breakpoint the links and account actions live in a toggled menu
  const [menuOpen, setMenuOpen] = useState(false)

  // Loads the current session; authSlice stores the user when this succeeds
  useGetCurrentUserQuery()

  const closeMenu = () => setMenuOpen(false)

  const goTo = (path: string) => {
    closeMenu()
    navigate(path)
  }

  const handleLogout = async () => {
    closeMenu()
    try {
      await authApi.logout()
    } catch {
      // Even if the backend call fails, still clear local state so the user can log out
    }
    dispatch(clearUser())
    navigate('/')
  }

  // The search page has its own search bar
  const showNavbarSearch = Boolean(user) && location.pathname !== S.SEARCH_ROUTE

  // Rendered in the desktop bar and again inside the mobile menu
  const accountActions = user ? (
    <>
      <span className="max-w-28 truncate text-sm font-medium text-slate-700">
        {C.GREETING(user.name)}
      </span>
      <button
        type="button"
        onClick={handleLogout}
        className="whitespace-nowrap text-sm font-medium text-slate-600 transition hover:text-slate-900"
      >
        {C.LOGOUT}
      </button>
    </>
  ) : (
    <>
      <Button variant="outline" size="sm" onClick={() => goTo('/login')}>
        {C.LOGIN}
      </Button>
      <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => goTo('/register')}>
        {C.SIGN_UP}
      </Button>
    </>
  )

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-xl">
        <div className="flex items-center justify-between gap-4 px-6 py-2 md:grid md:grid-cols-[1fr_auto_1fr]">
          <Link
            to="/"
            onClick={closeMenu}
            className="flex shrink-0 items-center gap-2 justify-self-start"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white">
              <Home className="h-4 w-4" />
            </div>
            <span className="whitespace-nowrap text-lg font-semibold">{C.BRAND_NAME}</span>
          </Link>

          <nav className="hidden items-center gap-4 md:flex xl:gap-8">
            {NAV_ITEMS.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.end} className={navLinkClass}>
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-3 justify-self-end md:flex">
            {showNavbarSearch && (
              // Only shown once the bar is wide enough to hold it without squeezing the links
              <div className="hidden min-[1400px]:block">
                <NavbarSearch />
              </div>
            )}
            {accountActions}
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? C.MENU_CLOSE_LABEL : C.MENU_OPEN_LABEL}
            aria-expanded={menuOpen}
            aria-controls={C.MENU_ID}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 md:hidden"
          >
            {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>

        {menuOpen && (
          <div id={C.MENU_ID} className="border-t border-slate-200 px-6 py-2 md:hidden">
            <nav className="flex flex-col">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={closeMenu}
                  className={(state) => `py-2 ${navLinkClass(state)}`}
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
            <div className="mt-2 flex items-center justify-between gap-3 border-t border-slate-200 py-2">
              {accountActions}
            </div>
          </div>
        )}
      </header>

      <main className="flex flex-1 flex-col">
        <ContentLayout>
          <Outlet />
        </ContentLayout>
      </main>
    </div>
  )
}

export default App