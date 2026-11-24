import { myOpenHousesConstants as M } from "@/common/constants"
import type {
  MyOpenHouseCountsDTO,
  MyOpenHouseGroup,
  MyOpenHouseItemDTO,
} from "@/store/propertiesApi"

export type MyOpenHousesView = (typeof M.VIEWS)[number]

// The tab named in the address; null when there is none or it is not one of the tabs
export function parseTab(value: string | null): MyOpenHouseGroup | null {
  return M.TABS.find((tab) => tab === value) ?? null
}

export function parseView(value: string | null): MyOpenHousesView {
  return M.VIEWS.find((view) => view === value) ?? M.DEFAULT_VIEW
}

// With no tab in the address, the first tab that has something in it is shown, so the page
// does not open on an empty "Today" when the user has upcoming open houses
export function pickDefaultTab(counts: MyOpenHouseCountsDTO): MyOpenHouseGroup {
  return M.TABS.find((tab) => counts[tab] > 0) ?? M.DEFAULT_TAB
}

// "Today" is the user's own day, so the browser's time zone is sent to the backend
export function getBrowserTimeZone(
  resolve: () => string | undefined = () => Intl.DateTimeFormat().resolvedOptions().timeZone,
): string {
  try {
    return resolve() || M.DEFAULT_TIME_ZONE
  } catch {
    return M.DEFAULT_TIME_ZONE
  }
}

// The backend refuses it before the open house has started, so the button is not offered then
export function canMarkAttended(
  item: Pick<MyOpenHouseItemDTO, "attended" | "openHouse">,
  nowMs: number,
): boolean {
  return !item.attended && new Date(item.openHouse.startDatetime).getTime() <= nowMs
}

function statusOf(error: unknown): unknown {
  return typeof error === "object" && error !== null && "status" in error
    ? error.status
    : undefined
}

export function isNotFoundError(error: unknown): boolean {
  return statusOf(error) === M.STATUS_NOT_FOUND
}

export function isNotStartedError(error: unknown): boolean {
  return statusOf(error) === M.STATUS_NOT_STARTED
}

// After a request the list on screen is out of date when it worked, and also when the entry
// was not found: it is gone already (removed in another tab, or by a double click)
export function listNeedsRefresh(error: unknown): boolean {
  return error == null || isNotFoundError(error)
}

export function tagsToInvalidate(error: unknown): (typeof M.API_TAG)[] {
  return listNeedsRefresh(error) ? [M.API_TAG] : []
}
