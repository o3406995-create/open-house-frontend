import { propertyDetailsConstants as D } from "@/common/constants"
import type { OpenHouseDTO } from "@/store/propertiesApi"

const dateFormatter = new Intl.DateTimeFormat(D.LOCALE, {
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
})

const timeFormatter = new Intl.DateTimeFormat(D.LOCALE, {
  hour: "numeric",
  minute: "2-digit",
})

// Formatted in the browser's local time zone
export function formatOpenHouseDate(openHouse: OpenHouseDTO): string {
  return dateFormatter.format(new Date(openHouse.startDatetime))
}

export function formatOpenHouseTime(openHouse: OpenHouseDTO): string {
  return D.TIME_RANGE(
    timeFormatter.format(new Date(openHouse.startDatetime)),
    timeFormatter.format(new Date(openHouse.endDatetime)),
  )
}

// The backend returns every open house; keep the ones that have not finished yet.
export function getUpcomingOpenHouses(openHouses: OpenHouseDTO[], nowMs: number): OpenHouseDTO[] {
  return openHouses
    .filter((openHouse) => new Date(openHouse.endDatetime).getTime() > nowMs)
    .sort(
      (a, b) => new Date(a.startDatetime).getTime() - new Date(b.startDatetime).getTime(),
    )
}

// True when the open house starts on the same calendar day as nowMs, in the browser's time zone
export function isOpenHouseToday(openHouse: OpenHouseDTO, nowMs: number): boolean {
  return new Date(openHouse.startDatetime).toDateString() === new Date(nowMs).toDateString()
}