import { describe, it, expect, jest } from "@jest/globals"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import SavePropertyButton from "@/components/property/savePropertyButton"
import { propertyDetailsConstants as D, savedPropertiesConstants as C } from "@/common/constants"

// The three hooks are replaced with fakes, so no store or network is needed. The factory only
// calls the mock*() functions when the component renders, so it is safe to hoist.
const mockUseGetSavedPropertiesQuery = jest.fn<() => { data?: unknown; isLoading: boolean }>()
const mockSaveTrigger = jest.fn<(externalId: string) => { unwrap: () => Promise<unknown> }>()
const mockRemoveTrigger = jest.fn<(savedPropertyId: number) => { unwrap: () => Promise<unknown> }>()

jest.mock("@/store/propertiesApi", () => ({
  useGetSavedPropertiesQuery: () => mockUseGetSavedPropertiesQuery(),
  useSavePropertyMutation: () => [
    (externalId: string) => mockSaveTrigger(externalId),
    { isLoading: false },
  ],
  useRemoveSavedPropertyMutation: () => [
    (savedPropertyId: number) => mockRemoveTrigger(savedPropertyId),
    { isLoading: false },
  ],
}))

const ok = (value: unknown) => ({ unwrap: () => Promise.resolve(value) })
const fail = () => ({ unwrap: () => Promise.reject(new Error("request failed")) })

// The saved properties get the ids 7, 8, ... in the order given
function givenList(savedExternalIds: string[]) {
  mockUseGetSavedPropertiesQuery.mockReturnValue({
    isLoading: false,
    data: {
      savedProperties: savedExternalIds.map((externalId, index) => ({
        savedPropertyId: index + 7,
        property: { externalId },
      })),
    },
  })
}

describe("SavePropertyButton", () => {
  it("offers to save a property that is not saved yet", () => {
    givenList([])

    render(<SavePropertyButton externalId="mock-1" />)

    expect(screen.getByRole("button", { name: D.SAVE_PROPERTY })).toBeEnabled()
  })

  it("shows a property that is already saved as Saved", () => {
    givenList(["mock-1"])

    render(<SavePropertyButton externalId="mock-1" />)

    expect(screen.getByRole("button", { name: C.SAVED })).toBeInTheDocument()
  })

  it("is disabled while the saved list is loading", () => {
    mockUseGetSavedPropertiesQuery.mockReturnValue({ isLoading: true })

    render(<SavePropertyButton externalId="mock-1" />)

    expect(screen.getByRole("button")).toBeDisabled()
  })

  it("saves the property and then shows Saved, even when the list does not contain it", async () => {
    const user = userEvent.setup()
    givenList([])
    mockSaveTrigger.mockReturnValue(ok({ savedPropertyId: 42 }))
    render(<SavePropertyButton externalId="mock-1" />)

    await user.click(screen.getByRole("button", { name: D.SAVE_PROPERTY }))

    expect(mockSaveTrigger).toHaveBeenCalledWith("mock-1")
    expect(await screen.findByRole("button", { name: C.SAVED })).toBeInTheDocument()
  })

  it("removes a saved property by its id and shows Save Property again", async () => {
    const user = userEvent.setup()
    givenList(["mock-1"])
    mockRemoveTrigger.mockReturnValue(ok(undefined))
    render(<SavePropertyButton externalId="mock-1" />)

    await user.click(screen.getByRole("button", { name: C.SAVED }))

    expect(mockRemoveTrigger).toHaveBeenCalledWith(7)
    expect(await screen.findByRole("button", { name: D.SAVE_PROPERTY })).toBeInTheDocument()
  })

  it("can remove a property it has just saved, using the id from the save response", async () => {
    const user = userEvent.setup()
    givenList([])
    mockSaveTrigger.mockReturnValue(ok({ savedPropertyId: 42 }))
    mockRemoveTrigger.mockReturnValue(ok(undefined))
    render(<SavePropertyButton externalId="mock-1" />)

    await user.click(screen.getByRole("button", { name: D.SAVE_PROPERTY }))
    await user.click(await screen.findByRole("button", { name: C.SAVED }))

    expect(mockRemoveTrigger).toHaveBeenCalledWith(42)
  })

  it("shows an error and keeps the state when saving fails", async () => {
    const user = userEvent.setup()
    givenList([])
    mockSaveTrigger.mockReturnValue(fail())
    render(<SavePropertyButton externalId="mock-1" />)

    await user.click(screen.getByRole("button", { name: D.SAVE_PROPERTY }))

    expect(await screen.findByRole("alert")).toHaveTextContent(C.SAVE_ERROR)
    expect(screen.getByRole("button", { name: D.SAVE_PROPERTY })).toBeInTheDocument()
  })
})
