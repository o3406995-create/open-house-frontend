import type { ReactNode } from "react"
import { Link } from "react-router-dom"
import { Bath, BedDouble, CalendarDays, Car, Check, ImageOff, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { MyOpenHouseGroup, MyOpenHouseItemDTO } from "@/store/propertiesApi"
import { formatOpenHouseDate, formatOpenHouseTime } from "@/utils/formatOpenHouse"
import { canMarkAttended } from "@/utils/myOpenHouses"
import { myOpenHousesConstants as C, propertyDetailsConstants as D } from "@/common/constants"

const DETAILS_CLASS =
  "inline-flex min-h-9 items-center justify-center rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm font-medium text-blue-600 hover:bg-slate-50"

const GROUP_TAG_CLASS: Record<MyOpenHouseGroup, string> = {
  today: "bg-orange-100 text-orange-700",
  upcoming: "bg-blue-100 text-blue-700",
  attended: "bg-green-100 text-green-700",
  expired: "bg-slate-200 text-slate-600",
}

interface MyOpenHouseRowProps {
  item: MyOpenHouseItemDTO
  nowMs: number
  removing: boolean
  marking: boolean
  onRemove: (myOpenHouseId: number) => void
  onMarkAttended: (myOpenHouseId: number) => void
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

export default function MyOpenHouseRow({
  item,
  nowMs,
  removing,
  marking,
  onRemove,
  onMarkAttended,
}: MyOpenHouseRowProps) {
  const { property, openHouse, group } = item
  const canMark = canMarkAttended(item, nowMs)
  const busy = removing || marking

  return (
    <li className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center">
      <div className="flex min-w-0 flex-1 items-center gap-4">
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

      <div className="flex min-w-0 items-center gap-3 lg:w-64 lg:shrink-0">
        <CalendarDays className="h-4 w-4 shrink-0 text-blue-600" aria-hidden="true" />
        <div className="min-w-0 text-sm">
          <p className="font-medium text-slate-900">{formatOpenHouseDate(openHouse)}</p>
          <p className="text-slate-500">{formatOpenHouseTime(openHouse)}</p>
        </div>
        <span
          className={`shrink-0 rounded-md px-3 py-1 text-xs font-medium ${GROUP_TAG_CLASS[group]}`}
        >
          {C.GROUP_LABELS[group]}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2 lg:shrink-0 lg:justify-end">
        {!item.attended && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!canMark || busy}
            title={canMark ? undefined : C.NOT_STARTED_HINT}
            aria-label={C.MARK_LABEL(property.address)}
            onClick={() => onMarkAttended(item.myOpenHouseId)}
            className="border-green-200 text-green-700"
          >
            <Check className="h-4 w-4" aria-hidden="true" />
            {marking ? C.MARKING : C.MARK_ATTENDED}
          </Button>
        )}
        <Link to={D.PATH(property.externalId)} className={DETAILS_CLASS}>
          {C.VIEW_DETAILS}
        </Link>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={busy}
          aria-label={C.REMOVE_LABEL(property.address)}
          onClick={() => onRemove(item.myOpenHouseId)}
          className="text-slate-500 hover:text-red-600"
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">{removing ? C.REMOVING : C.REMOVE}</span>
        </Button>
      </div>
    </li>
  )
}
