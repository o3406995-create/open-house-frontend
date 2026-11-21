import type { ComponentProps } from "react"
import { describe, it, expect, jest } from "@jest/globals"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router-dom"
import SavedPropertyRow from "@/components/property/savedPropertyRow"
import type { OpenHouseDTO, SavedPropertyDTO } from "@/store/propertiesApi"
import { savedPropertiesConstants as C } from "@/common/constants"

// Local-time dates, so the tests do not depend on the machine's time zone
const NOW = new Date(2026, 10, 20, 8, 0).getTime()
const at = (day: number, hour: number) => new Date(2026, 10, day, hour, 0).toISOString()

const ADDRESS = "12 Example Street, Brisbane"

const house = (
  id: string,
  day: number,
  hour: number,
  status: OpenHouseDTO["status"] = "SCHEDULED",
): OpenHouseDTO => ({
  externalId: id,
  startDatetime: at(day, hour),
  endDatetime: at(day, hour + 1),
  status,
})

interface BuildOptions {
  listingStatus?: SavedPropertyDTO["listingStatus"]
  openHouses?: OpenHouseDTO[]
  thumbnailUrl?: string | null
}

function build({
  listingStatus = "AVAILABLE",
  openHouses = [house("mock-1-0", 20, 10), house("mock-1-1", 22, 10)],
  thumbnailUrl = null,
}: BuildOptions = {}): SavedPropertyDTO {
  return {
    savedPropertyId: 7,
    savedAt: at(17, 9),
    listingStatus,
    property: {
      externalId: "mock-1",
      source: "mock",
      address: ADDRESS,
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
      thumbnailUrl,
      openHouses,
    },
  }
}

const onRemove = jest.fn<(savedPropertyId: number) => void>()

function renderRow(extra: Partial<ComponentProps<typeof SavedPropertyRow>> = {}) {
  return render(
    <MemoryRouter>
      <ul>
        <SavedPropertyRow item={build()} nowMs={NOW} removing={false} onRemove={onRemove} {...extra} />
      </ul>
    </MemoryRouter>,
  )
}

describe("SavedPropertyRow", () => {
  it("shows the address and price and links to the property details", () => {
    renderRow()

    expect(screen.getByText(ADDRESS)).toBeInTheDocument()
    expect(screen.getByText("$650,000")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: C.VIEW_DETAILS })).toHaveAttribute(
      "href",
      "/properties/mock-1",
    )
  })

  it("marks an open house that is today and counts the others", () => {
    renderRow()

    expect(screen.getByText(C.TODAY)).toBeInTheDocument()
    expect(screen.getByText(C.MORE_OPEN_HOUSES(1))).toBeInTheDocument()
  })

  it("does not mark an open house on another day", () => {
    renderRow({ item: build({ openHouses: [house("mock-1-1", 22, 10)] }) })

    expect(screen.queryByText(C.TODAY)).not.toBeInTheDocument()
    expect(screen.queryByText(C.MORE_OPEN_HOUSES(1))).not.toBeInTheDocument()
  })

  it("says so when there is no upcoming open house", () => {
    renderRow({ item: build({ openHouses: [] }) })

    expect(screen.getByText(C.NO_UPCOMING_OPEN_HOUSE)).toBeInTheDocument()
  })

  it("ignores finished and cancelled open houses", () => {
    renderRow({
      item: build({ openHouses: [house("old", 19, 10), house("cancelled", 21, 10, "CANCELLED")] }),
    })

    expect(screen.getByText(C.NO_UPCOMING_OPEN_HOUSE)).toBeInTheDocument()
  })

  it("keeps a removed listing visible but without open houses or a details link", () => {
    renderRow({ item: build({ listingStatus: "REMOVED" }) })

    expect(screen.getByText(ADDRESS)).toBeInTheDocument()
    expect(screen.getByText(C.NO_LONGER_LISTED)).toBeInTheDocument()
    expect(screen.queryByText(C.TODAY)).not.toBeInTheDocument()
    expect(screen.queryByText(C.NO_UPCOMING_OPEN_HOUSE)).not.toBeInTheDocument()
    expect(screen.queryByRole("link")).not.toBeInTheDocument()
    expect(screen.getByRole("button", { name: C.VIEW_DETAILS })).toBeDisabled()
  })

  it("can still remove a listing that is no longer listed", () => {
    renderRow({ item: build({ listingStatus: "REMOVED" }) })

    expect(screen.getByRole("button", { name: C.REMOVE_LABEL(ADDRESS) })).toBeEnabled()
  })

  it("warns when the details could not be checked", () => {
    renderRow({ item: build({ listingStatus: "UNKNOWN" }) })

    expect(screen.getByText(C.MAY_BE_OUT_OF_DATE)).toBeInTheDocument()
    expect(screen.getByRole("link", { name: C.VIEW_DETAILS })).toBeInTheDocument()
  })

  it("does not show the warning for a listing that was checked", () => {
    renderRow()

    expect(screen.queryByText(C.MAY_BE_OUT_OF_DATE)).not.toBeInTheDocument()
  })

  it("calls onRemove with the saved property id", async () => {
    const user = userEvent.setup()
    renderRow()

    await user.click(screen.getByRole("button", { name: C.REMOVE_LABEL(ADDRESS) }))

    expect(onRemove).toHaveBeenCalledWith(7)
  })

  it("disables the remove button while it is being removed", () => {
    renderRow({ removing: true })

    expect(screen.getByRole("button", { name: C.REMOVE_LABEL(ADDRESS) })).toBeDisabled()
  })

  it("shows the thumbnail when there is one", () => {
    const { container } = renderRow({ item: build({ thumbnailUrl: "https://example.com/a.jpg" }) })

    expect(container.querySelector("img")).toHaveAttribute("src", "https://example.com/a.jpg")
  })

  it("shows a placeholder when there is no thumbnail", () => {
    const { container } = renderRow()

    expect(container.querySelector("img")).toBeNull()
  })
})
