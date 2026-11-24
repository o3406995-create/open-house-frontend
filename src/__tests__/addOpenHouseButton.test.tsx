import { describe, it, expect, jest } from "@jest/globals"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import AddOpenHouseButton from "@/components/property/addOpenHouseButton"
import type { MyOpenHouseItemDTO, MyOpenHousesDTO } from "@/store/propertiesApi"
import { getBrowserTimeZone } from "@/utils/myOpenHouses"
import { myOpenHousesConstants as C, propertyDetailsConstants as D } from "@/common/constants"

// The three hooks are replaced with fakes, so these tests cover the button and not the network.
// The wrappers read the mocks when they are called, because the factory runs before the
// constants below exist.
const mockUseList = jest.fn<(timeZone: string, options?: unknown) => unknown>()
const mockAdd =
  jest.fn<(body: { propertyExternalId: string; openHouseExternalId: string }) => unknown>()
const mockRemove = jest.fn<(id: number) => unknown>()

jest.mock("@/store/propertiesApi", () => ({
  useGetMyOpenHousesQuery: (timeZone: string, options?: unknown) => mockUseList(timeZone, options),
  useAddMyOpenHouseMutation: () => [
    (body: { propertyExternalId: string; openHouseExternalId: string }) => mockAdd(body),
  ],
  useRemoveMyOpenHouseMutation: () => [(id: number) => mockRemove(id)],
}))

function entry(
  myOpenHouseId: number,
  propertyExternalId: string,
  openHouseExternalId: string,
): MyOpenHouseItemDTO {
  return {
    myOpenHouseId,
    addedAt: "2026-11-20T00:00:00.000Z",
    attended: false,
    group: "upcoming",
    openHouse: {
      externalId: openHouseExternalId,
      startDatetime: "2026-11-25T00:00:00.000Z",
      endDatetime: "2026-11-25T00:30:00.000Z",
      status: "SCHEDULED",
    },
    property: {
      externalId: propertyExternalId,
      source: "mock",
      address: "12 Example Street",
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

function givenList(items: MyOpenHouseItemDTO[]) {
  const data: MyOpenHousesDTO = {
    timeZone: "Australia/Brisbane",
    counts: { today: 0, upcoming: items.length, attended: 0, expired: 0 },
    myOpenHouses: { today: [], upcoming: items, attended: [], expired: [] },
  }
  mockUseList.mockReturnValue({ data, isLoading: false })
}

const succeeds = (value?: unknown) => ({ unwrap: () => Promise.resolve(value) })
const fails = (status: number | string) => ({ unwrap: () => Promise.reject({ status }) })

const PROPERTY = "mock-1"
const OPEN_HOUSE = "mock-1-0"

function renderButton(openHouseExternalId: string | null = OPEN_HOUSE) {
  return render(
    <AddOpenHouseButton propertyExternalId={PROPERTY} openHouseExternalId={openHouseExternalId} />,
  )
}

const addButton = () => screen.getByRole("button", { name: D.ADD_OPEN_HOUSE })
const addedButton = () => screen.getByRole("button", { name: C.ADDED })

describe("AddOpenHouseButton: adding", () => {
  it("offers to add an open house that is not in My Open Houses", () => {
    givenList([])
    renderButton()

    expect(addButton()).toBeEnabled()
  })

  it("asks for the list with the time zone of the browser", () => {
    givenList([])
    renderButton()

    expect(mockUseList).toHaveBeenCalledWith(getBrowserTimeZone(), { skip: false })
  })

  it("adds the chosen open house and then shows it as added", async () => {
    const user = userEvent.setup()
    givenList([])
    mockAdd.mockReturnValue(succeeds({ myOpenHouseId: 5 }))
    renderButton()

    await user.click(addButton())

    expect(mockAdd).toHaveBeenCalledWith({
      propertyExternalId: PROPERTY,
      openHouseExternalId: OPEN_HOUSE,
    })
    expect(await screen.findByRole("button", { name: C.ADDED })).toBeInTheDocument()
    expect(screen.queryByRole("alert")).not.toBeInTheDocument()
  })

  it("disables the button while it is adding", async () => {
    const user = userEvent.setup()
    givenList([])
    mockAdd.mockReturnValue({ unwrap: () => new Promise<never>(() => {}) })
    renderButton()

    await user.click(addButton())

    expect(addButton()).toBeDisabled()
    expect(addButton()).toHaveAttribute("aria-busy", "true")
  })

  it("says the open house is no longer available after a 409", async () => {
    const user = userEvent.setup()
    givenList([])
    mockAdd.mockReturnValue(fails(409))
    renderButton()

    await user.click(addButton())

    expect(await screen.findByRole("alert")).toHaveTextContent(C.ADD_UNAVAILABLE_ERROR)
    expect(addButton()).toBeEnabled()
  })

  it("says it could not be found after a 404", async () => {
    const user = userEvent.setup()
    givenList([])
    mockAdd.mockReturnValue(fails(404))
    renderButton()

    await user.click(addButton())

    expect(await screen.findByRole("alert")).toHaveTextContent(C.ADD_NOT_FOUND_ERROR)
  })

  it("gives a general message for any other failure", async () => {
    const user = userEvent.setup()
    givenList([])
    mockAdd.mockReturnValue(fails("FETCH_ERROR"))
    renderButton()

    await user.click(addButton())

    expect(await screen.findByRole("alert")).toHaveTextContent(C.ADD_ERROR)
  })

  it("clears an earlier message when the user tries again", async () => {
    const user = userEvent.setup()
    givenList([])
    mockAdd.mockReturnValueOnce(fails(500)).mockReturnValueOnce(succeeds({ myOpenHouseId: 5 }))
    renderButton()

    await user.click(addButton())
    expect(await screen.findByRole("alert")).toBeInTheDocument()

    await user.click(addButton())

    expect(await screen.findByRole("button", { name: C.ADDED })).toBeInTheDocument()
    expect(screen.queryByRole("alert")).not.toBeInTheDocument()
  })
})

describe("AddOpenHouseButton: already added", () => {
  it("shows an open house that is in the list as added, and says it can be removed", () => {
    givenList([entry(7, PROPERTY, OPEN_HOUSE)])
    renderButton()

    expect(addedButton()).toHaveAttribute("title", C.ADDED_HINT)
    expect(screen.queryByRole("button", { name: D.ADD_OPEN_HOUSE })).not.toBeInTheDocument()
  })

  it("does not take an open house with the same id from another property", () => {
    givenList([entry(7, "mock-2", OPEN_HOUSE)])
    renderButton()

    expect(addButton()).toBeInTheDocument()
  })

  it("removes the entry when it is clicked and then offers to add it again", async () => {
    const user = userEvent.setup()
    givenList([entry(7, PROPERTY, OPEN_HOUSE)])
    mockRemove.mockReturnValue(succeeds())
    renderButton()

    await user.click(addedButton())

    expect(mockRemove).toHaveBeenCalledWith(7)
    expect(mockAdd).not.toHaveBeenCalled()
    expect(await screen.findByRole("button", { name: D.ADD_OPEN_HOUSE })).toBeInTheDocument()
  })

  it("treats a 404 on removing as done, because the entry is gone already", async () => {
    const user = userEvent.setup()
    givenList([entry(7, PROPERTY, OPEN_HOUSE)])
    mockRemove.mockReturnValue(fails(404))
    renderButton()

    await user.click(addedButton())

    expect(await screen.findByRole("button", { name: D.ADD_OPEN_HOUSE })).toBeInTheDocument()
    expect(screen.queryByRole("alert")).not.toBeInTheDocument()
  })

  it("says so and keeps the open house as added when removing fails", async () => {
    const user = userEvent.setup()
    givenList([entry(7, PROPERTY, OPEN_HOUSE)])
    mockRemove.mockReturnValue(fails(500))
    renderButton()

    await user.click(addedButton())

    expect(await screen.findByRole("alert")).toHaveTextContent(C.REMOVE_ERROR)
    expect(addedButton()).toBeInTheDocument()
  })
})

describe("AddOpenHouseButton: when it cannot be used", () => {
  it("is disabled while the list is loading", () => {
    mockUseList.mockReturnValue({ data: undefined, isLoading: true })
    renderButton()

    expect(addButton()).toBeDisabled()
  })

  it("is disabled when there is no open house to choose, says why and does not ask for the list", () => {
    mockUseList.mockReturnValue({ data: undefined, isLoading: false })
    renderButton(null)

    expect(addButton()).toBeDisabled()
    expect(addButton()).toHaveAttribute("title", C.NO_OPEN_HOUSE_HINT)
    expect(mockUseList).toHaveBeenCalledWith(getBrowserTimeZone(), { skip: true })
  })
})
