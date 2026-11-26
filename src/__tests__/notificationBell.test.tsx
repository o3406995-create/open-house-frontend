import { describe, it, expect, jest } from "@jest/globals"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router-dom"
import NotificationBell from "@/components/notifications/notificationBell"
import { notificationsParams } from "@/utils/notifications"

// The query and the logged-in user are replaced with fakes: what is checked is what the bell shows
// and whether it asks at all.
const mockQuery = jest.fn<(args: unknown, options: unknown) => unknown>()
const mockUser = jest.fn<() => { role: string } | null>()

jest.mock("@/store/propertiesApi", () => ({
  useGetNotificationsQuery: (args: unknown, options: unknown) => mockQuery(args, options),
}))

jest.mock("@/store/hooks", () => ({
  useAppSelector: (select: (state: unknown) => unknown) => select({ auth: { user: mockUser() } }),
}))

interface ShowOptions {
  role?: string | null
  // null: the first answer has not come yet
  unread?: number | null
  onNavigate?: () => void
}

function show({ role = "USER", unread = 0, onNavigate }: ShowOptions = {}) {
  mockUser.mockReturnValue(role === null ? null : { role })
  mockQuery.mockReturnValue(unread === null ? {} : { data: { unreadCount: unread } })

  return render(
    <MemoryRouter>
      <NotificationBell onNavigate={onNavigate} />
    </MemoryRouter>,
  )
}

describe("NotificationBell", () => {
  it("links to the notifications page and says how many are unread", () => {
    show({ unread: 3 })

    const link = screen.getByRole("link", { name: "Notifications, 3 unread" })
    expect(link).toHaveAttribute("href", "/notifications")
    expect(screen.getByText("3")).toBeInTheDocument()
  })

  it("shows no number when nothing is unread", () => {
    show({ unread: 0 })

    expect(screen.getByRole("link", { name: "Notifications" })).toBeInTheDocument()
    expect(screen.queryByText("0")).not.toBeInTheDocument()
  })

  it("shows 99+ for a lot", () => {
    show({ unread: 150 })

    expect(screen.getByRole("link", { name: "Notifications, 99+ unread" })).toBeInTheDocument()
    expect(screen.getByText("99+")).toBeInTheDocument()
  })

  it("has no number before the first answer", () => {
    show({ unread: null })

    expect(screen.getByRole("link", { name: "Notifications" })).toBeInTheDocument()
  })

  it("asks for the first page, the same request as the notifications page, and again every minute", () => {
    show({ unread: 1 })

    expect(mockQuery).toHaveBeenCalledWith({ page: 1, pageSize: 20 }, { pollingInterval: 60000 })
  })

  it("asks with exactly the arguments of the first page of the list, so that the two share one answer", () => {
    show({ unread: 1 })

    expect(mockQuery.mock.calls[0]?.[0]).toEqual(notificationsParams(1))
  })

  it.each(["AGENT", "ADMIN"])("shows nothing to a %s account and never asks for notifications", (role) => {
    const { container } = show({ role })

    expect(container).toBeEmptyDOMElement()
    expect(mockQuery).not.toHaveBeenCalled()
  })

  it("shows nothing and never asks when nobody is logged in", () => {
    const { container } = show({ role: null })

    expect(container).toBeEmptyDOMElement()
    expect(mockQuery).not.toHaveBeenCalled()
  })

  it("tells the menu when it is followed", async () => {
    const onNavigate = jest.fn<() => void>()
    show({ unread: 1, onNavigate })

    await userEvent.click(screen.getByRole("link", { name: "Notifications, 1 unread" }))

    expect(onNavigate).toHaveBeenCalledTimes(1)
  })
})
