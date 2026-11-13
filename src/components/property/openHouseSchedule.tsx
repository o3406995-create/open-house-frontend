import { Calendar, CalendarDays } from "lucide-react"
import type { OpenHouseDTO } from "@/store/propertiesApi"
import { formatOpenHouseDate, formatOpenHouseTime } from "@/utils/formatOpenHouse"
import { propertyDetailsConstants as D } from "@/common/constants"

interface OpenHouseScheduleProps {
  openHouses: OpenHouseDTO[]
  selectedId: string | null
  onSelect: (externalId: string) => void
}

export default function OpenHouseSchedule({
  openHouses,
  selectedId,
  onSelect,
}: OpenHouseScheduleProps) {
  return (
    <section aria-label={D.UPCOMING_OPEN_HOUSES} className="rounded-xl bg-slate-50 p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
        <CalendarDays className="h-4 w-4 text-blue-600" aria-hidden="true" />
        {D.UPCOMING_OPEN_HOUSES}
      </div>

      {openHouses.length === 0 ? (
        <p className="text-sm text-slate-500">{D.NO_UPCOMING}</p>
      ) : (
        <ul className="space-y-2">
          {openHouses.map((openHouse) => {
            const isCancelled = openHouse.status !== D.OPEN_HOUSE_STATUS_SCHEDULED
            const isSelected = openHouse.externalId === selectedId

            return (
              <li key={openHouse.externalId}>
                <button
                  type="button"
                  disabled={isCancelled}
                  aria-pressed={isSelected}
                  onClick={() => onSelect(openHouse.externalId)}
                  className={`flex w-full items-center justify-between gap-3 rounded-lg border px-3 py-2 text-left text-sm transition ${
                    isCancelled
                      ? "cursor-not-allowed border-transparent text-slate-400 line-through"
                      : isSelected
                        ? "border-blue-500 bg-blue-50 text-slate-900"
                        : "border-transparent text-slate-700 hover:bg-white"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
                    {formatOpenHouseDate(openHouse)}
                  </span>
                  <span className="shrink-0">
                    {isCancelled ? D.CANCELLED : formatOpenHouseTime(openHouse)}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}