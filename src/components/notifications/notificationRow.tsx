import { Link } from "react-router-dom"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatOpenHouseDate, formatOpenHouseTime } from "@/utils/formatOpenHouse"
import { labelOf } from "@/utils/notifications"
import type { NotificationDTO } from "@/store/propertiesApi"
import { notificationsConstants as N, savedPropertiesConstants as P } from "@/common/constants"

interface NotificationRowProps {
  item: NotificationDTO
  marking: boolean
  failed: boolean
  onMarkRead: (notificationId: number) => void
}

export default function NotificationRow({ item, marking, failed, onMarkRead }: NotificationRowProps) {
  return (
    <li className={`flex items-start gap-3 p-4 ${item.isRead ? "" : "bg-blue-50/50"}`}>
      <Bell
        className={`mt-1 h-4 w-4 shrink-0 ${item.isRead ? "text-slate-400" : "text-blue-600"}`}
        aria-hidden="true"
      />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
            {labelOf(item.type)}
          </span>
          {/* Words, not only a colour, tell that it is unread */}
          {!item.isRead && (
            <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-semibold uppercase text-white">
              {N.UNREAD}
            </span>
          )}
        </div>

        {/* Following the link marks it as read; the page changes whatever the answer is */}
        <Link
          to={P.PROPERTY_ROUTE(item.property.externalId)}
          onClick={() => {
            if (!item.isRead) onMarkRead(item.notificationId)
          }}
          className="mt-1 block text-sm font-medium text-slate-900 hover:text-blue-700"
        >
          {item.message}
        </Link>

        <p className="mt-0.5 text-sm text-slate-500">
          {formatOpenHouseDate(item.openHouse)} · {formatOpenHouseTime(item.openHouse)}
        </p>

        {failed && (
          <p role="alert" className="mt-1 text-xs text-red-600">
            {N.MARK_READ_FAILED}
          </p>
        )}
      </div>

      {!item.isRead && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={marking}
          aria-label={N.MARK_READ_LABEL(item.message)}
          onClick={() => onMarkRead(item.notificationId)}
        >
          {N.MARK_READ}
        </Button>
      )}
    </li>
  )
}
