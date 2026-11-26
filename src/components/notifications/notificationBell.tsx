import { Link } from "react-router-dom"
import { Bell } from "lucide-react"
import { useAppSelector } from "@/store/hooks"
import { useGetNotificationsQuery } from "@/store/propertiesApi"
import { badgeText, bellLabel, canSeeNotifications, notificationsParams } from "@/utils/notifications"
import { notificationsConstants as N } from "@/common/constants"

// The bell asks for the first page, exactly as the notifications page does, so the two share one
// answer (and one request a minute): the number on the bell and the list can never disagree
const BELL_PARAMS = notificationsParams(1)

interface NotificationBellProps {
  // Called when the bell is followed, so that the mobile menu can close
  onNavigate?: (() => void) | undefined
}

function BellLink({ onNavigate }: NotificationBellProps) {
  const { data } = useGetNotificationsQuery(BELL_PARAMS, { pollingInterval: N.POLL_INTERVAL_MS })
  const unread = data?.unreadCount ?? 0
  const badge = badgeText(unread)

  return (
    <Link
      to={N.ROUTE}
      onClick={onNavigate}
      aria-label={bellLabel(unread)}
      className="relative inline-flex rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
    >
      <Bell className="h-5 w-5" aria-hidden="true" />
      {badge && (
        <span
          aria-hidden="true"
          className="absolute -right-0.5 -top-0.5 min-w-[1.1rem] rounded-full bg-red-600 px-1 text-center text-[10px] font-semibold leading-4 text-white"
        >
          {badge}
        </span>
      )}
    </Link>
  )
}

// Only the accounts that have notifications ask for them. The check is here, one level above the
// query, so for the others the query is never made (the server would answer 403 every minute).
export default function NotificationBell({ onNavigate }: NotificationBellProps) {
  const role = useAppSelector((state) => state.auth.user?.role)

  if (!canSeeNotifications(role)) return null

  return <BellLink onNavigate={onNavigate} />
}
