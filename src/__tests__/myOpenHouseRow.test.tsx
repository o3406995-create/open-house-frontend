import type { ComponentProps } from "react"
import { describe, it, expect, jest } from "@jest/globals"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router-dom"
import MyOpenHouseRow from "@/components/myOpenHouses/myOpenHouseRow"
import type { MyOpenHouseGroup, MyOpenHouseItemDTO } from "@/store/propertiesApi"
import { formatOpenHouseDate, formatOpenHouseTime } from "@/utils/formatOpenHouse"
import { myOpenHousesConstants as C } from "@/common/constants"

// Local-time dates, so the tests do not depend on the machine's time zone
const NOW = new Date(2026, 10, 20, 8, 0).getTime()
const at = (day: number, hour: number) => new Date(2026, 10, day, hour, 0).toISOString()

const ADDRESS = "12 Example Street, Brisbane"

interface BuildOptions {
  group?: MyOpenHouseGroup
  attended?: boolean
  startDay?: number
  startHour?: number
  carSpaces?: number | null
  thumbnailUrl?: string | null
}

// By default the open house starts at 10:00, two hours after NOW
function build({
  group = "today",
  attended = false,
  startDay = 20,
  startHour = 10,
  carSpaces = 2,
  thumbnailUrl = null,
}: BuildOptions = {}): MyOpenHouseItemDTO {
  return {
    myOpenHouseId: 9,
    addedAt: at(17, 9),
    attended,
    group,
    openHouse: {
      externalId: "mock-1-0",
      startDatetime: at(startDay, startHour),
      endDatetime: at(startDay, startHour + 1),
      status: "SCHEDULED",
    },
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
      carSpaces,
      propertyType: "House",
      latitude: -27.4698,
      longitude: 153.0251,
      thumbnailUrl,
      openHouses: [],
    },
  }
}

const onRemove = jest.fn<(id: number) => void>()
const onMarkAttended = jest.fn<(id: number) => void>()

function renderRow(
  item: MyOpenHouseItemDTO,
  extra: Partial<ComponentProps<typeof MyOpenHouseRow>> = {},
) {
  return render(
    <MemoryRouter>
      <ul>
        <MyOpenHouseRow
          item={item}
          nowMs={NOW}
          removing={false}
          marking={false}
          onRemove={onRemove}
          onMarkAttended={onMarkAttended}
          {...extra}
        />
      </ul>
    </MemoryRouter>,
  )
}

const markButton = () => screen.queryByRole("button", { name: C.MARK_LABEL(ADDRESS) })
const removeButton = () => screen.getByRole("button", { name: C.REMOVE_LABEL(ADDRESS) })

describe("MyOpenHouseRow", () => {
  it("shows the address and price and links to the property details", () => {
    renderRow(build())

    expect(screen.getByText(ADDRESS)).toBeInTheDocument()
    expect(screen.getByText("$650,000")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: C.VIEW_DETAILS })).toHaveAttribute(
      "href",
      "/properties/mock-1",
    )
  })

  it("shows the date and the time of the open house", () => {
    const item = build()
    renderRow(item)

    expect(screen.getByText(formatOpenHouseDate(item.openHouse))).toBeInTheDocument()
    expect(screen.getByText(formatOpenHouseTime(item.openHouse))).toBeInTheDocument()
  })

  it.each([
    ["today", "Today"],
    ["upcoming", "Upcoming"],
    ["attended", "Attended"],
    ["expired", "Expired"],
  ] as const)("labels an entry of the group %s", (group, label) => {
    renderRow(build({ group, attended: group === "attended" }))

    expect(screen.getByText(label)).toBeInTheDocument()
  })

  it("offers to confirm attendance once the open house has started", async () => {
    const user = userEvent.setup()
    renderRow(build({ startHour: 7 }))

    expect(markButton()).toBeEnabled()
    await user.click(markButton()!)

    expect(onMarkAttended).toHaveBeenCalledWith(9)
  })

  it("offers it after the open house has finished too", () => {
    renderRow(build({ group: "expired", startDay: 18 }))

    expect(markButton()).toBeEnabled()
  })

  it("does not offer it before the open house has started, and says why", () => {
    renderRow(build({ group: "upcoming", startHour: 10 }))

    expect(markButton()).toBeDisabled()
    expect(markButton()).toHaveAttribute("title", C.NOT_STARTED_HINT)
  })

  it("has no button to confirm attendance for an entry that is attended", () => {
    renderRow(build({ group: "attended", attended: true, startHour: 7 }))

    expect(markButton()).not.toBeInTheDocument()
  })

  it("calls onRemove with the entry id", async () => {
    const user = userEvent.setup()
    renderRow(build())

    await user.click(removeButton())

    expect(onRemove).toHaveBeenCalledWith(9)
  })

  it("disables both buttons and says so while it is being removed", () => {
    renderRow(build({ startHour: 7 }), { removing: true })

    expect(removeButton()).toBeDisabled()
    expect(markButton()).toBeDisabled()
    expect(screen.getByText(C.REMOVING)).toBeInTheDocument()
  })

  it("disables both buttons and says so while it is being saved", () => {
    renderRow(build({ startHour: 7 }), { marking: true })

    expect(removeButton()).toBeDisabled()
    expect(markButton()).toBeDisabled()
    expect(screen.getByText(C.MARKING)).toBeInTheDocument()
  })

  it("shows the car spaces only when they are known", () => {
    const { unmount } = renderRow(build({ carSpaces: 2 }))
    expect(screen.getByText(C.CAR_SPACES)).toBeInTheDocument()
    unmount()

    renderRow(build({ carSpaces: null }))
    expect(screen.queryByText(C.CAR_SPACES)).not.toBeInTheDocument()
  })

  it("shows a placeholder when there is no thumbnail", () => {
    const { container } = renderRow(build())

    expect(container.querySelector("img")).toBeNull()
  })

  it("shows the thumbnail when there is one", () => {
    const { container } = renderRow(build({ thumbnailUrl: "https://example.com/a.jpg" }))

    expect(container.querySelector("img")).toHaveAttribute("src", "https://example.com/a.jpg")
  })
})
