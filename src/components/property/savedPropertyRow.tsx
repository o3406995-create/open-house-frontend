import type { ReactNode } from "react"
import { Link } from "react-router-dom"
import { Bath, BedDouble, CalendarDays, Car, ImageOff, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { SavedPropertyDTO } from "@/store/propertiesApi"
import {
  formatOpenHouseDate,
  formatOpenHouseTime,
  getUpcomingOpenHouses,
  isOpenHouseToday,
} from "@/utils/formatOpenHouse"
import { propertyDetailsConstants as D, savedPropertiesConstants as C } from "@/common/constants"

const DETAILS_CLASS =
  "inline-flex min-h-9 items-center justify-center rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm font-medium text-blue-600"

interface SavedPropertyRowProps {
  item: SavedPropertyDTO
  nowMs: number
  removing: boolean
  onRemove: (savedPropertyId: number) => void
  // Shown under the row over its whole width (the note)
  footer?: ReactNode
}

function Stat({ icon, value, label }: { icon: ReactNode; value: number; label: string }) {
  return (
    <span className="flex items-center gap-1">
      {icon}
      <span>{value}</span>
      <span className="sr-only">{label}</span>
    </span>
  )
}

export default function SavedPropertyRow({
  item,
  nowMs,
  removing,
  onRemove,
  footer,
}: SavedPropertyRowProps) {
  const { property, listingStatus } = item
  const removed = listingStatus === C.LISTING_STATUS_REMOVED

  // A removed listing has no live open houses; for the others only upcoming, scheduled ones count
  const upcoming = removed
    ? []
    : getUpcomingOpenHouses(property.openHouses, nowMs).filter(
        (openHouse) => openHouse.status === D.OPEN_HOUSE_STATUS_SCHEDULED,
      )
  const next = upcoming[0]
  const moreCount = upcoming.length - 1

  let openHouseBlock: ReactNode
  if (removed) {
    openHouseBlock = (
      <span className="rounded-md bg-slate-200 px-3 py-1 text-xs font-medium text-slate-600">
        {C.NO_LONGER_LISTED}
      </span>
    )
  } else if (next) {
    openHouseBlock = (
      <>
        <CalendarDays className="h-4 w-4 shrink-0 text-blue-600" aria-hidden="true" />
        <div className="min-w-0 text-sm">
          <p className="font-medium text-slate-900">{formatOpenHouseDate(next)}</p>
          <p className="text-slate-500">
            {formatOpenHouseTime(next)}
            {moreCount > 0 && (
              <span className="ml-2 text-xs text-slate-400">{C.MORE_OPEN_HOUSES(moreCount)}</span>
            )}
          </p>
        </div>
        {isOpenHouseToday(next, nowMs) && (
          <span className="shrink-0 rounded-md bg-orange-100 px-3 py-1 text-xs font-medium text-orange-700">
            {C.TODAY}
          </span>
        )}
      </>
    )
  } else {
    openHouseBlock = <p className="text-sm text-slate-400">{C.NO_UPCOMING_OPEN_HOUSE}</p>
  }

  return (
    <li className="p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className={`flex min-w-0 flex-1 items-center gap-4 ${removed ? "opacity-60" : ""}`}>
          {property.thumbnailUrl ? (
            <img
              src={property.thumbnailUrl}
              alt=""
              loading="lazy"
              decoding="async"
              className="h-14 w-20 shrink-0 rounded-lg bg-slate-100 object-cover"
            />
          ) : (
            <div className="flex h-14 w-20 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
              <ImageOff className="h-5 w-5" aria-hidden="true" />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-slate-900">{property.address}</p>
            <p className="truncate text-sm text-slate-500">
              {property.suburb} {property.state} {property.postcode}
            </p>
            {listingStatus === C.LISTING_STATUS_UNKNOWN && (
              <p className="text-xs text-amber-600">{C.MAY_BE_OUT_OF_DATE}</p>
            )}
            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600">
              <Stat
                icon={<BedDouble className="h-4 w-4" aria-hidden="true" />}
                value={property.bedrooms}
                label={C.BEDROOMS}
              />
              <Stat
                icon={<Bath className="h-4 w-4" aria-hidden="true" />}
                value={property.bathrooms}
                label={C.BATHROOMS}
              />
              {property.carSpaces !== null && (
                <Stat
                  icon={<Car className="h-4 w-4" aria-hidden="true" />}
                  value={property.carSpaces}
                  label={C.CAR_SPACES}
                />
              )}
              <span className="font-medium text-slate-900">{property.displayPrice}</span>
            </div>
          </div>
        </div>

        <div className="flex min-w-0 items-center gap-3 sm:w-64">{openHouseBlock}</div>

        <div className="flex items-center gap-2 sm:justify-end">
          {removed ? (
            <button
              type="button"
              disabled
              className={`${DETAILS_CLASS} cursor-not-allowed opacity-50`}
            >
              {C.VIEW_DETAILS}
            </button>
          ) : (
            <Link
              to={C.PROPERTY_ROUTE(property.externalId)}
              className={`${DETAILS_CLASS} hover:bg-slate-50`}
            >
              {C.VIEW_DETAILS}
            </Link>
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={removing}
            aria-label={C.REMOVE_LABEL(property.address)}
            onClick={() => onRemove(item.savedPropertyId)}
            className="text-slate-500 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">{removing ? C.REMOVING : C.REMOVE}</span>
          </Button>
        </div>
      </div>
      {footer && <div className="mt-3 border-t border-slate-100 pt-3">{footer}</div>}
    </li>
  )
}
