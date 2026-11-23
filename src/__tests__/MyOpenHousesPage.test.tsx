import { describe, it, expect, jest } from "@jest/globals"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router-dom"
import MyOpenHouses from "@/pages/MyOpenHouses"
import type {
  MyOpenHouseGroup,
  MyOpenHouseItemDTO,
  MyOpenHousesDTO,
} from "@/store/propertiesApi"
import { getBrowserTimeZone } from "@/utils/myOpenHouses"
import { loginPageConstants as L, myOpenHousesConstants as C } from "@/common/constants"

// The three hooks are replaced with fakes, so these tests cover the page and not the network.
// The wrappers read the mocks when they are called, because the factory runs before the
// constants below exist.
const mockUseList = jest.fn<(timeZone: string, options?: unknown) => unknown>()
const mockRemove = jest.fn<(id: number) => unknown>()
const mockMark = jest.fn<(id: number) => unknown>()
const mockRefetch = jest.fn<() => unknown>()

jest.mock("@/store/propertiesApi", () => ({
  useGetMyOpenHousesQuery: (timeZone: string, options?: unknown) => mockUseList(timeZone, options),
  useRemoveMyOpenHouseMutation: () => [(id: number) => mockRemove(id)],
  useMarkMyOpenHouseAttendedMutation: () => [(id: number) => mockMark(id)],
}))

const HOUR = 60 * 60 * 1000
const now = Date.now()
const iso = (offsetHours: number) => new Date(now + offsetHours * HOUR).toISOString()

// startOffsetHours is relative to now: negative means the open house has started
function entry(
  id: number,
  group: MyOpenHouseGroup,
  startOffsetHours: number,
): MyOpenHouseItemDTO {
  return {
    myOpenHouseId: id,
    addedAt: iso(-48),
    attended: group === "attended",
    group,
    openHouse: {
      externalId: `oh-${id}`,
      startDatetime: iso(startOffsetHours),
      endDatetime: iso(startOffsetHours + 1),
      status: "SCHEDULED",
    },
    property: {
      externalId: `mock-${id}`,
      source: "mock",
      address: `${id} Example Street`,
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
    },
  }
}

function listOf(groups: Partial<Record<MyOpenHouseGroup, MyOpenHouseItemDTO[]>>): MyOpenHousesDTO {
  const full = {
    today: groups.today ?? [],
    upcoming: groups.upcoming ?? [],
    attended: groups.attended ?? [],
    expired: groups.expired ?? [],
  }

  return {
    timeZone: "Australia/Brisbane",
    counts: {
      today: full.today.length,
      upcoming: full.upcoming.length,
      attended: full.attended.length,
      expired: full.expired.length,
    },
    myOpenHouses: full,
  }
}

function givenList(data: MyOpenHousesDTO) {
  mockUseList.mockReturnValue({
    data,
    error: undefined,
    isLoading: false,
    isFetching: false,
    refetch: mockRefetch,
  })
}

function givenError(status: number | string) {
  mockUseList.mockReturnValue({
    data: undefined,
    error: { status },
    isLoading: false,
    isFetching: false,
    refetch: mockRefetch,
  })
}

const succeeds = () => ({ unwrap: () => Promise.resolve() })
const fails = (status: number | string) => ({ unwrap: () => Promise.reject({ status }) })

function renderPage(path = "/my-open-houses") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <MyOpenHouses />
    </MemoryRouter>,
  )
}

const tab = (name: string) => screen.getByRole("tab", { name })
const removeButton = (id: number) =>
  screen.getByRole("button", { name: C.REMOVE_LABEL(`${id} Example Street`) })
const markButton = (id: number) =>
  screen.getByRole("button", { name: C.MARK_LABEL(`${id} Example Street`) })

describe("MyOpenHouses page: loading and errors", () => {
  it("shows a skeleton while the list is loading", () => {
    mockUseList.mockReturnValue({ data: undefined, isLoading: true })
    renderPage()

    expect(screen.getByRole("status", { name: C.LOADING_LABEL })).toBeInTheDocument()
  })

  it("asks for the list with the time zone of the browser and asks again on every visit", () => {
    givenList(listOf({}))
    renderPage()

    expect(mockUseList).toHaveBeenCalledWith(getBrowserTimeZone(), {
      refetchOnMountOrArgChange: true,
    })
  })

  it("asks the user to log in after a 401", () => {
    givenError(401)
    renderPage()

    expect(screen.getByText(C.LOGIN_REQUIRED_TITLE)).toBeInTheDocument()
    expect(screen.getByRole("link", { name: C.LOGIN_ACTION })).toHaveAttribute(
      "href",
      L.LOGIN_ROUTE,
    )
  })

  it("says the page is for user accounts after a 403", () => {
    givenError(403)
    renderPage()

    expect(screen.getByText(C.USER_ONLY_TITLE)).toBeInTheDocument()
  })

  it("shows an error with a retry button after any other failure", async () => {
    const user = userEvent.setup()
    givenError("FETCH_ERROR")
    renderPage()

    expect(screen.getByRole("alert")).toHaveTextContent(C.ERROR_TITLE)
    await user.click(screen.getByRole("button", { name: C.RETRY }))

    expect(mockRefetch).toHaveBeenCalledTimes(1)
  })
})

describe("MyOpenHouses page: tabs", () => {
  const data = listOf({
    today: [entry(1, "today", 2)],
    upcoming: [entry(2, "upcoming", 30), entry(3, "upcoming", 54)],
    expired: [entry(4, "expired", -30)],
  })

  it("shows how many entries each tab has", () => {
    givenList(data)
    renderPage()

    expect(tab("Today (1)")).toBeInTheDocument()
    expect(tab("Upcoming (2)")).toBeInTheDocument()
    expect(tab("Attended (0)")).toBeInTheDocument()
    expect(tab("Expired (1)")).toBeInTheDocument()
  })

  it("opens on the first tab that has entries when the address names none", () => {
    givenList(listOf({ upcoming: [entry(2, "upcoming", 30)], expired: [entry(4, "expired", -30)] }))
    renderPage()

    expect(tab("Upcoming (1)")).toHaveAttribute("aria-selected", "true")
    expect(screen.getByText("2 Example Street")).toBeInTheDocument()
    expect(screen.queryByText("4 Example Street")).not.toBeInTheDocument()
  })

  it("keeps the tab named in the address", () => {
    givenList(data)
    renderPage(`/my-open-houses?${C.TAB_PARAM}=expired`)

    expect(tab("Expired (1)")).toHaveAttribute("aria-selected", "true")
    expect(screen.getByText("4 Example Street")).toBeInTheDocument()
    expect(screen.queryByText("1 Example Street")).not.toBeInTheDocument()
  })

  it("falls back to the first tab with entries when the address names an unknown tab", () => {
    givenList(listOf({ upcoming: [entry(2, "upcoming", 30)] }))
    renderPage(`/my-open-houses?${C.TAB_PARAM}=nonsense`)

    expect(tab("Upcoming (1)")).toHaveAttribute("aria-selected", "true")
  })

  it("switches to another tab and shows only its entries", async () => {
    const user = userEvent.setup()
    givenList(data)
    renderPage()

    await user.click(tab("Expired (1)"))

    expect(tab("Expired (1)")).toHaveAttribute("aria-selected", "true")
    expect(screen.getByText("4 Example Street")).toBeInTheDocument()
    expect(screen.queryByText("1 Example Street")).not.toBeInTheDocument()
  })

  it("keeps the other parameters of the address when a tab is chosen", async () => {
    const user = userEvent.setup()
    givenList(data)
    renderPage(`/my-open-houses?${C.VIEW_PARAM}=list`)

    await user.click(tab("Upcoming (2)"))

    expect(tab("Upcoming (2)")).toHaveAttribute("aria-selected", "true")
  })

  it.each(C.TABS)("explains an empty %s tab", (group) => {
    givenList(listOf({}))
    renderPage(`/my-open-houses?${C.TAB_PARAM}=${group}`)

    expect(screen.getByText(C.EMPTY_TITLES[group])).toBeInTheDocument()
    expect(screen.getByText(C.EMPTY_BODIES[group])).toBeInTheDocument()
  })

  it.each(["today", "upcoming"] as const)("offers a search from an empty %s tab", (group) => {
    givenList(listOf({}))
    renderPage(`/my-open-houses?${C.TAB_PARAM}=${group}`)

    expect(screen.getByRole("link", { name: C.EMPTY_ACTION })).toBeInTheDocument()
  })

  it.each(["attended", "expired"] as const)("does not offer a search from an empty %s tab", (group) => {
    givenList(listOf({}))
    renderPage(`/my-open-houses?${C.TAB_PARAM}=${group}`)

    expect(screen.queryByRole("link", { name: C.EMPTY_ACTION })).not.toBeInTheDocument()
  })

  it("shows the list view, and the map view is not available yet", () => {
    givenList(data)
    renderPage()

    expect(screen.getByRole("button", { name: C.LIST_VIEW })).toHaveAttribute("aria-pressed", "true")
    expect(screen.getByRole("button", { name: C.MAP_VIEW })).toBeDisabled()
  })
})

describe("MyOpenHouses page: removing", () => {
  const data = listOf({ today: [entry(1, "today", 2)] })

  it("removes the entry", async () => {
    const user = userEvent.setup()
    givenList(data)
    mockRemove.mockReturnValue(succeeds())
    renderPage()

    await user.click(removeButton(1))

    expect(mockRemove).toHaveBeenCalledWith(1)
    expect(screen.queryByRole("alert")).not.toBeInTheDocument()
  })

  it("says so when removing fails", async () => {
    const user = userEvent.setup()
    givenList(data)
    mockRemove.mockReturnValue(fails(500))
    renderPage()

    await user.click(removeButton(1))

    expect(await screen.findByRole("alert")).toHaveTextContent(C.REMOVE_ERROR)
  })

  it("says nothing when the entry was gone already (404)", async () => {
    const user = userEvent.setup()
    givenList(data)
    mockRemove.mockReturnValue(fails(404))
    renderPage()

    await user.click(removeButton(1))

    expect(mockRemove).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole("alert")).not.toBeInTheDocument()
  })

  it("disables the buttons of the entry while it is being removed", async () => {
    const user = userEvent.setup()
    givenList(data)
    mockRemove.mockReturnValue({ unwrap: () => new Promise<void>(() => {}) })
    renderPage()

    await user.click(removeButton(1))

    expect(removeButton(1)).toBeDisabled()
    expect(screen.getByText(C.REMOVING)).toBeInTheDocument()
  })
})

describe("MyOpenHouses page: confirming attendance", () => {
  // Started two hours ago, so the button can be used
  const data = listOf({ today: [entry(1, "today", -2)] })

  it("confirms attendance", async () => {
    const user = userEvent.setup()
    givenList(data)
    mockMark.mockReturnValue(succeeds())
    renderPage()

    await user.click(markButton(1))

    expect(mockMark).toHaveBeenCalledWith(1)
    expect(screen.queryByRole("alert")).not.toBeInTheDocument()
  })

  it("says the open house has not started when the backend refuses (409)", async () => {
    const user = userEvent.setup()
    givenList(data)
    mockMark.mockReturnValue(fails(409))
    renderPage()

    await user.click(markButton(1))

    expect(await screen.findByRole("alert")).toHaveTextContent(C.NOT_STARTED_ERROR)
  })

  it("says so when saving fails", async () => {
    const user = userEvent.setup()
    givenList(data)
    mockMark.mockReturnValue(fails("FETCH_ERROR"))
    renderPage()

    await user.click(markButton(1))

    expect(await screen.findByRole("alert")).toHaveTextContent(C.MARK_ERROR)
  })

  it("says nothing when the entry was gone already (404)", async () => {
    const user = userEvent.setup()
    givenList(data)
    mockMark.mockReturnValue(fails(404))
    renderPage()

    await user.click(markButton(1))

    expect(mockMark).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole("alert")).not.toBeInTheDocument()
  })

  it("clears an earlier message when the user tries again", async () => {
    const user = userEvent.setup()
    givenList(data)
    mockMark.mockReturnValueOnce(fails(500)).mockReturnValueOnce(succeeds())
    renderPage()

    await user.click(markButton(1))
    expect(await screen.findByRole("alert")).toBeInTheDocument()

    await user.click(markButton(1))

    expect(screen.queryByRole("alert")).not.toBeInTheDocument()
  })
})
