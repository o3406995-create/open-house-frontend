import { describe, it, expect, jest } from "@jest/globals"
import { render, screen } from "@testing-library/react"
import { MemoryRouter, Routes, Route, useLocation } from "react-router-dom"
import ProtectedRoute from "@/components/ProtectedRoute"
import { loginPageConstants } from "@/common/constants"

// The hooks are replaced with fakes so no store or network is needed. The factories only
// call the mock*() functions when a component renders, so they are safe to hoist.
const mockUseAppSelector = jest.fn<(selector: unknown) => unknown>()
const mockUseGetCurrentUserQuery = jest.fn<
  () => { isLoading: boolean; isUninitialized: boolean }
>()

jest.mock("@/store/hooks", () => ({
  useAppSelector: (selector: unknown) => mockUseAppSelector(selector),
}))
jest.mock("@/store/authApi", () => ({
  useGetCurrentUserQuery: () => mockUseGetCurrentUserQuery(),
}))

function LoginProbe() {
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from
  return <div>login page, from: {from}</div>
}

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route
          path="/properties/:id"
          element={
            <ProtectedRoute>
              <div>secret content</div>
            </ProtectedRoute>
          }
        />
        <Route path={loginPageConstants.LOGIN_ROUTE} element={<LoginProbe />} />
      </Routes>
    </MemoryRouter>,
  )
}

const finished = { isLoading: false, isUninitialized: false }

describe("ProtectedRoute", () => {
  it("shows a loading message while the current user is being fetched", () => {
    mockUseAppSelector.mockReturnValue(null)
    mockUseGetCurrentUserQuery.mockReturnValue({ isLoading: true, isUninitialized: false })

    renderAt("/properties/mock-1")

    expect(screen.getByText("Loading...")).toBeInTheDocument()
    expect(screen.queryByText("secret content")).not.toBeInTheDocument()
  })

  it("also waits before the query has started", () => {
    mockUseAppSelector.mockReturnValue(null)
    mockUseGetCurrentUserQuery.mockReturnValue({ isLoading: false, isUninitialized: true })

    renderAt("/properties/mock-1")

    expect(screen.getByText("Loading...")).toBeInTheDocument()
    expect(screen.queryByText(/login page/)).not.toBeInTheDocument()
  })

  it("sends a visitor without a user to login and remembers where they came from", () => {
    mockUseAppSelector.mockReturnValue(null)
    mockUseGetCurrentUserQuery.mockReturnValue(finished)

    renderAt("/properties/mock-1?tab=2")

    expect(screen.getByText(/login page/)).toHaveTextContent("from: /properties/mock-1?tab=2")
    expect(screen.queryByText("secret content")).not.toBeInTheDocument()
  })

  it("shows the page to a logged in user", () => {
    mockUseAppSelector.mockReturnValue({ user_id: 1 })
    mockUseGetCurrentUserQuery.mockReturnValue(finished)

    renderAt("/properties/mock-1")

    expect(screen.getByText("secret content")).toBeInTheDocument()
    expect(screen.queryByText(/login page/)).not.toBeInTheDocument()
  })
})
