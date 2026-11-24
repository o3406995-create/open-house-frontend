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
import { myOpenHousesConstants as C } from "@/common/constants"

// The hooks and the map are replaced with fakes: the map cannot be drawn in jsdom, so what is
// checked here is when the page shows it and what it is given. The wrappers read the mocks
// when they are called, because the factories run before the constants below exist.
const mockUseList = jest.fn<(timeZone: string, options?: unknown) => unknown>()
const mockMapProps = jest.fn<(props: { items: unknown[] }) => unknown>()

jest.mock("@/store/propertiesApi", () => ({
  useGetMyOpenHousesQuery: (timeZone: string, options?: unknown) => mockUseList(timeZone, options),
  useRemoveMyOpenHouseMutation: () => [() => Promise.resolve()],
  useMarkMyOpenHouseAttendedMutation: () => [() => Promise.resolve()],
}))

jest.mock("@/components/myOpenHouses/myOpenHousesMap", () => ({
  __esModule: true,
  default: (props: { items: unknown[] }) => mockMapProps(props) ?? null,
}))

function entry(id: number, group: MyOpenHouseGroup): MyOpenHouseItemDTO {
  return {
    myOpenHouseId: id,
    addedAt: "2026-11-20T00:00:00.000Z",
    attended: group === "attended",
    group,
    openHouse: {
      externalId: "oh-" + id,
      startDatetime: "2026-11-25T00:00:00.000Z",
      endDatetime: "2026-11-25T00:30:00.000Z",
      status: "SCHEDULED",
    },
    property: {
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
    },
  }
}

function givenList(groups: Partial<Record<MyOpenHouseGroup, MyOpenHouseItemDTO[]>>) {
  const full = {
    today: groups.today ?? [],
    upcoming: groups.upcoming ?? [],
    attended: groups.attended ?? [],
    expired: groups.expired ?? [],
  }
  const data: MyOpenHousesDTO = {
    timeZone: "Australia/Brisbane",
    counts: {
      today: full.today.length,
      upcoming: full.upcoming.length,
      attended: full.attended.length,
      expired: full.expired.length,
    },
    myOpenHouses: full,
  }
  mockUseList.mockReturnValue({ data, isLoading: false, isFetching: false })
}

function renderPage(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <MyOpenHouses />
    </MemoryRouter>,
  )
}

const itemCountOfLastMap = () => {
  const calls = mockMapProps.mock.calls
  return calls[calls.length - 1]?.[0].items.length
}

const LIST = { name: C.LIST_LABEL }

describe("MyOpenHouses page: map view", () => {
  const groups = {
    upcoming: [entry(2, "upcoming"), entry(3, "upcoming")],
    expired: [entry(4, "expired")],
  }

  it("does not load the map in the list view", () => {
    givenList(groups)
    renderPage("/my-open-houses?tab=upcoming")

    expect(mockMapProps).not.toHaveBeenCalled()
    expect(screen.getByRole("list", LIST)).toBeInTheDocument()
  })

  it("shows the map instead of the list with the entries of the active tab", () => {
    givenList(groups)
    renderPage("/my-open-houses?tab=upcoming&view=map")

    expect(screen.getByRole("button", { name: C.MAP_VIEW })).toHaveAttribute("aria-pressed", "true")
    expect(itemCountOfLastMap()).toBe(2)
    expect(screen.queryByRole("list", LIST)).not.toBeInTheDocument()
  })

  it("switches to the map and back to the list", async () => {
    const user = userEvent.setup()
    givenList(groups)
    renderPage("/my-open-houses?tab=upcoming")

    await user.click(screen.getByRole("button", { name: C.MAP_VIEW }))
    expect(itemCountOfLastMap()).toBe(2)
    expect(screen.queryByRole("list", LIST)).not.toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: C.LIST_VIEW }))
    expect(screen.getByRole("list", LIST)).toBeInTheDocument()
  })

  it("keeps the map when another tab is chosen and gives it that tab's entries", async () => {
    const user = userEvent.setup()
    givenList(groups)
    renderPage("/my-open-houses?tab=upcoming&view=map")

    await user.click(screen.getByRole("tab", { name: "Expired (1)" }))

    expect(screen.getByRole("button", { name: C.MAP_VIEW })).toHaveAttribute("aria-pressed", "true")
    expect(itemCountOfLastMap()).toBe(1)
  })

  it("shows the empty message instead of a map when the tab has nothing", () => {
    givenList({})
    renderPage("/my-open-houses?view=map")

    expect(screen.getByText(C.EMPTY_TITLES.today)).toBeInTheDocument()
    expect(mockMapProps).not.toHaveBeenCalled()
  })

  it("falls back to the list for an unknown view in the address", () => {
    givenList(groups)
    renderPage("/my-open-houses?tab=upcoming&view=grid")

    expect(screen.getByRole("list", LIST)).toBeInTheDocument()
    expect(mockMapProps).not.toHaveBeenCalled()
  })
})
