import { describe, it, expect, jest } from "@jest/globals"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router-dom"
import Notifications from "@/pages/Notifications"
import type {
  NotificationDTO,
  NotificationsPageDTO,
  PropertySummaryDTO,
} from "@/store/propertiesApi"

interface QueryArgs {
  page: number
  pageSize: number
}

interface QueryOptions {
  skip?: boolean
}

// The requests and the logged-in user are replaced with fakes: what is checked is what the page
// shows, what it asks for and what it does with the answers.
const mockQuery = jest.fn<(args: QueryArgs, options: QueryOptions) => unknown>()
const mockMarkRead = jest.fn<(notificationId: number) => { unwrap: () => Promise<unknown> }>()
const mockRefetch = jest.fn<() => unknown>()
const mockUser = jest.fn<() => { role: string } | null>()

jest.mock("@/store/propertiesApi", () => ({
  useGetNotificationsQuery: (args: QueryArgs, options: QueryOptions) => mockQuery(args, options),
  useMarkNotificationReadMutation: () => [
    (notificationId: number) => mockMarkRead(notificationId),
  ],
}))

jest.mock("@/store/hooks", () => ({
  useAppSelector: (select: (state: unknown) => unknown) => select({ auth: { user: mockUser() } }),
}))

function property(id: number): PropertySummaryDTO {
  return {
    externalId: "mock-" + id,
    source: "mock",
    address: id + " Example Street",
    suburb: "Brisbane",
    state: "QLD",
    postcode: "4000",
    price: 650000,
    displayPrice: "$650,000",
    bedrooms: 3,
    bathrooms: 2,
    carSpaces: 2,
    propertyType: "House",
    latitude: -27.4698,
    longitude: 153.0251,
    thumbnailUrl: null,
    openHouses: [],
  }
}

function notification(id: number, overrides: Partial<NotificationDTO> = {}): NotificationDTO {
  return {
    notificationId: id,
    type: "OPEN_HOUSE_REMINDER",
    message: `Open house tomorrow at ${id} Example Street`,
    isRead: false,
    createdAt: "2026-11-26T08:00:00.000Z",
    openHouse: {
      externalId: `mock-${id}-0`,
      startDatetime: "2026-11-27T00:00:00.000Z",
      endDatetime: "2026-11-27T00:30:00.000Z",
      status: "SCHEDULED",
    },
    property: property(id),
    ...overrides,
  }
}

function answer(items: NotificationDTO[], overrides: Partial<NotificationsPageDTO> = {}) {
  const data: NotificationsPageDTO = {
    notifications: items,
    total: items.length,
    unreadCount: items.filter((item) => !item.isRead).length,
    page: 1,
    pageSize: 20,
    ...overrides,
  }
  return { data, isLoading: false, isFetching: false, refetch: mockRefetch }
}

// The first notification is unread, the second one is read
const defaultQuery = () => answer([notification(1), notification(2, { isRead: true })])

const markReadWorks = () => ({ unwrap: () => Promise.resolve({}) })

// An error with a status, the way a failed request looks
const markReadFails = (status: number) => () => ({
  unwrap: () => Promise.reject(Object.assign(new Error("failed"), { status })),
})

interface ShowOptions {
  role?: string | null
  query?: (args: QueryArgs) => unknown
  markRead?: () => { unwrap: () => Promise<unknown> }
}

function show({ role = "USER", query = defaultQuery, markRead = markReadWorks }: ShowOptions = {}) {
  mockUser.mockReturnValue(role === null ? null : { role })
  mockQuery.mockImplementation((args) => query(args))
  mockMarkRead.mockImplementation(() => markRead())

  return render(
    <MemoryRouter>
      <Notifications />
    </MemoryRouter>,
  )
}

const FAILED = "We could not mark it as read. Try again."

// What the page asks the list with besides the page: it is kept fresh like the bell
const FRESH = { pollingInterval: 60000, refetchOnMountOrArgChange: true }

describe("Notifications page", () => {
  it("shows a loading state first", () => {
    show({
      query: () => ({ data: undefined, isLoading: true, isFetching: true, refetch: mockRefetch }),
    })

    expect(screen.getByRole("status", { name: "Loading your notifications" })).toBeInTheDocument()
  })

  it("says so when there are none", () => {
    show({ query: () => answer([]) })

    expect(screen.getByText("No notifications yet")).toBeInTheDocument()
  })

  it("offers to try again when the list cannot be loaded", async () => {
    show({
      query: () => ({ data: undefined, isLoading: false, isFetching: false, refetch: mockRefetch }),
    })

    expect(screen.getByRole("alert")).toHaveTextContent("We could not load your notifications")
    await userEvent.click(screen.getByRole("button", { name: "Try again" }))

    expect(mockRefetch).toHaveBeenCalledTimes(1)
  })

  it("lists the notifications with the kind of each", () => {
    show({
      query: () =>
        answer([
          notification(1),
          notification(2, {
            type: "OPEN_HOUSE_TODAY",
            message: "Open house today at 2 Example Street",
          }),
        ]),
    })

    expect(screen.getByRole("list", { name: "Notifications" })).toBeInTheDocument()
    expect(screen.getByText("Open house tomorrow at 1 Example Street")).toBeInTheDocument()
    expect(screen.getByText("Open house today at 2 Example Street")).toBeInTheDocument()
    expect(screen.getByText("Open house tomorrow")).toBeInTheDocument()
    expect(screen.getByText("Open house today")).toBeInTheDocument()
  })

  it("tells the unread ones in words and offers to mark only those as read", () => {
    show()

    expect(screen.getAllByText("Unread")).toHaveLength(1)
    expect(screen.getAllByRole("button", { name: /^Mark as read/ })).toHaveLength(1)
  })

  it("marks a notification as read from its button", async () => {
    show()

    await userEvent.click(
      screen.getByRole("button", { name: "Mark as read: Open house tomorrow at 1 Example Street" }),
    )

    expect(mockMarkRead).toHaveBeenCalledTimes(1)
    expect(mockMarkRead).toHaveBeenCalledWith(1)
  })

  it("links an unread notification to its property and marks it as read when it is followed", async () => {
    show()

    const link = screen.getByRole("link", { name: "Open house tomorrow at 1 Example Street" })
    expect(link).toHaveAttribute("href", "/properties/mock-1")
    await userEvent.click(link)

    expect(mockMarkRead).toHaveBeenCalledWith(1)
  })

  it("marks nothing as read when a notification that was read already is followed", async () => {
    show()

    await userEvent.click(
      screen.getByRole("link", { name: "Open house tomorrow at 2 Example Street" }),
    )

    expect(mockMarkRead).not.toHaveBeenCalled()
  })

  it("disables the button while the notification is being marked", async () => {
    show({ markRead: () => ({ unwrap: () => new Promise(() => undefined) }) })

    const button = screen.getByRole("button", { name: /^Mark as read/ })
    await userEvent.click(button)

    expect(button).toBeDisabled()
  })

  it("says so when marking as read fails", async () => {
    show({ markRead: markReadFails(500) })

    await userEvent.click(screen.getByRole("button", { name: /^Mark as read/ }))

    expect(await screen.findByText(FAILED)).toBeInTheDocument()
  })

  it("says nothing when the notification is gone already (404)", async () => {
    show({ markRead: markReadFails(404) })

    const button = screen.getByRole("button", { name: /^Mark as read/ })
    await userEvent.click(button)
    await waitFor(() => expect(button).toBeEnabled())

    expect(screen.queryByText(FAILED)).not.toBeInTheDocument()
  })

  it("asks for the first page, in pages of 20", () => {
    show()

    expect(mockQuery).toHaveBeenCalledWith({ page: 1, pageSize: 20 }, { skip: false, ...FRESH })
  })

  it("starts on the first page: no way back, and a way on when there is more", () => {
    show({ query: () => answer([notification(1), notification(2)], { total: 3, pageSize: 2 }) })

    expect(screen.getByText("Showing 1-2 of 3")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled()
    expect(screen.getByRole("button", { name: "Next" })).toBeEnabled()
  })

  it("asks for the next page and stops at the last one", async () => {
    show({
      query: ({ page }) =>
        page === 1
          ? answer([notification(1), notification(2)], { total: 3, pageSize: 2 })
          : answer([notification(3)], { total: 3, page: 2, pageSize: 2 }),
    })

    await userEvent.click(screen.getByRole("button", { name: "Next" }))

    expect(mockQuery).toHaveBeenLastCalledWith({ page: 2, pageSize: 20 }, { skip: false, ...FRESH })
    expect(screen.getByText("Showing 3-3 of 3")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled()
    expect(screen.getByRole("button", { name: "Previous" })).toBeEnabled()
  })

  it("tells an account that has no notifications, and does not ask for them", () => {
    show({ role: "AGENT" })

    expect(
      screen.getByText("Notifications are not available for this account"),
    ).toBeInTheDocument()
    expect(mockQuery).toHaveBeenCalledWith({ page: 1, pageSize: 20 }, { skip: true, ...FRESH })
  })

  it("does not break on a type of notification it does not know", () => {
    show({ query: () => answer([notification(1, { type: "SOMETHING_NEW" })]) })

    expect(screen.getByText("Notification")).toBeInTheDocument()
    expect(screen.getByText("Open house tomorrow at 1 Example Street")).toBeInTheDocument()
  })
})
