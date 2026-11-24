import { errorStatus } from "@/utils/errorStatus"
import { myOpenHousesConstants as M } from "@/common/constants"
import type { MyOpenHouseItemDTO, MyOpenHousesDTO } from "@/store/propertiesApi"

// What the button on the details page last did. The list is refreshed after it, but the button
// must not flicker back to the old state while that request is on its way.
export interface LastAction {
  myOpenHouseId: number | null
}

// An open house id is only unique within its property, so both ids are compared
export function findEntry(
  list: MyOpenHousesDTO | undefined,
  propertyExternalId: string,
  openHouseExternalId: string,
): MyOpenHouseItemDTO | undefined {
  if (!list) return undefined

  return M.TABS.flatMap((group) => list.myOpenHouses[group]).find(
    (item) =>
      item.property.externalId === propertyExternalId &&
      item.openHouse.externalId === openHouseExternalId,
  )
}

// The id of the entry when this open house is in My Open Houses, otherwise null. What the
// button did last wins over the list, which may be one request behind.
export function entryIdFor(
  lastAction: LastAction | null,
  fromList: MyOpenHouseItemDTO | undefined,
): number | null {
  if (lastAction) return lastAction.myOpenHouseId
  return fromList?.myOpenHouseId ?? null
}

export function addErrorMessage(error: unknown): string {
  const status = errorStatus(error)

  if (status === M.STATUS_UNAVAILABLE) return M.ADD_UNAVAILABLE_ERROR
  if (status === M.STATUS_NOT_FOUND) return M.ADD_NOT_FOUND_ERROR
  return M.ADD_ERROR
}
