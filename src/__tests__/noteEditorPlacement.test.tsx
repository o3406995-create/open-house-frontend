import { describe, it, expect, jest } from "@jest/globals"
import { render } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import SavedProperties from "@/pages/SavedProperties"
import MyOpenHouses from "@/pages/MyOpenHouses"
import type {
  MyOpenHouseItemDTO,
  NoteSummaryDTO,
  PropertySummaryDTO,
  SavedPropertyDTO,
} from "@/store/propertiesApi"

interface EditorProps {
  target: unknown
  note: unknown
  subject: string
}

const mockSavedList = jest.fn<(args: unknown) => unknown>()
const mockMyList = jest.fn<(timeZone: string, options?: unknown) => unknown>()
const mockEditor = jest.fn<(props: EditorProps) => unknown>()

jest.mock("@/store/propertiesApi", () => ({
  useGetSavedPropertiesQuery: (args: unknown) => mockSavedList(args),
  useRemoveSavedPropertyMutation: () => [() => Promise.resolve()],
  useGetMyOpenHousesQuery: (timeZone: string, options?: unknown) => mockMyList(timeZone, options),
  useRemoveMyOpenHouseMutation: () => [() => Promise.resolve()],
  useMarkMyOpenHouseAttendedMutation: () => [() => Promise.resolve()],
}))

// The editor is replaced with a fake: what is checked here is what each page hands to it
jest.mock("@/components/notes/noteEditor", () => ({
  __esModule: true,
  default: (props: EditorProps) => mockEditor(props) ?? null,
}))

const NOTE: NoteSummaryDTO = {
  noteId: 5,
  content: "Call the agent",
  updatedAt: "2026-11-24T01:00:00.000Z",
}

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

function savedItem(savedPropertyId: number, note: NoteSummaryDTO | null): SavedPropertyDTO {
  return {
    savedPropertyId,
    savedAt: "2026-11-20T00:00:00.000Z",
    listingStatus: "AVAILABLE",
    note,
    property: property(savedPropertyId + 100),
  }
}

function entry(myOpenHouseId: number, note: NoteSummaryDTO | null): MyOpenHouseItemDTO {
  return {
    myOpenHouseId,
    addedAt: "2026-11-20T00:00:00.000Z",
    attended: false,
    group: "upcoming",
    openHouse: {
      externalId: "oh-" + myOpenHouseId,
      startDatetime: "2099-01-01T00:00:00.000Z",
      endDatetime: "2099-01-01T00:30:00.000Z",
      status: "SCHEDULED",
    },
    note,
    property: property(myOpenHouseId + 100),
  }
}

const editorProps = () => mockEditor.mock.calls.map(([props]) => props)

describe("the note editor in the pages", () => {
  it("gives each saved property its own note and its saved property id", () => {
    mockSavedList.mockReturnValue({
      data: { savedProperties: [savedItem(11, NOTE), savedItem(12, null)], total: 2, page: 1, pageSize: 10 },
      isLoading: false,
      isFetching: false,
    })

    render(
      <MemoryRouter>
        <SavedProperties />
      </MemoryRouter>,
    )

    expect(editorProps()).toContainEqual({
      target: { kind: "savedProperty", id: 11 },
      note: NOTE,
      subject: "111 Example Street",
    })
    expect(editorProps()).toContainEqual({
      target: { kind: "savedProperty", id: 12 },
      note: null,
      subject: "112 Example Street",
    })
  })

  it("gives each entry in My Open Houses its own note and its entry id", () => {
    mockMyList.mockReturnValue({
      data: {
        timeZone: "Australia/Brisbane",
        counts: { today: 0, upcoming: 2, attended: 0, expired: 0 },
        myOpenHouses: {
          today: [],
          upcoming: [entry(21, NOTE), entry(22, null)],
          attended: [],
          expired: [],
        },
      },
      isLoading: false,
      isFetching: false,
    })

    render(
      <MemoryRouter initialEntries={["/my-open-houses?tab=upcoming"]}>
        <MyOpenHouses />
      </MemoryRouter>,
    )

    expect(editorProps()).toContainEqual({
      target: { kind: "userOpenHouse", id: 21 },
      note: NOTE,
      subject: "121 Example Street",
    })
    expect(editorProps()).toContainEqual({
      target: { kind: "userOpenHouse", id: 22 },
      note: null,
      subject: "122 Example Street",
    })
  })
})
