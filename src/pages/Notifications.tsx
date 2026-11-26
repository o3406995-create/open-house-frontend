import { useState, type ReactNode } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import MessageCard from "@/components/messageCard"
import NotificationRow from "@/components/notifications/notificationRow"
import { useAppSelector } from "@/store/hooks"
import { useGetNotificationsQuery, useMarkNotificationReadMutation } from "@/store/propertiesApi"
import {
  canSeeNotifications,
  notificationsParams,
  shouldRefreshAfterRead,
  totalPagesOf,
} from "@/utils/notifications"
import { notificationsConstants as N } from "@/common/constants"

function ListSkeleton() {
  return (
    <div
      role="status"
      aria-label={N.LOADING_LABEL}
      className="animate-pulse divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white"
    >
      {[0, 1, 2].map((key) => (
        <div key={key} className="flex items-center gap-4 p-4">
          <div className="h-4 w-4 rounded-full bg-slate-200" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-2/3 rounded bg-slate-200" />
            <div className="h-3 w-1/3 rounded bg-slate-200" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function Notifications() {
  const role = useAppSelector((state) => state.auth.user?.role)
  const allowed = canSeeNotifications(role)

  const [page, setPage] = useState(1)
  const [markingId, setMarkingId] = useState<number | null>(null)
  const [failedId, setFailedId] = useState<number | null>(null)

  // For an account that has no notifications the query is skipped, not made
  const { data, isLoading, isFetching, refetch } = useGetNotificationsQuery(
    notificationsParams(page),
    {
      skip: !allowed,
      // Asked for again every minute like the bell, and whenever the page opens: a list that was
      // cached while it was empty must not stay empty while the bell already counts new ones
      pollingInterval: N.POLL_INTERVAL_MS,
      refetchOnMountOrArgChange: true,
    },
  )
  const [markRead] = useMarkNotificationReadMutation()

  const handleMarkRead = async (notificationId: number) => {
    setFailedId(null)
    setMarkingId(notificationId)
    try {
      await markRead(notificationId).unwrap()
    } catch (error) {
      // A notification that is gone already (404) needs no message: the list is asked for again
      if (!shouldRefreshAfterRead(error)) {
        setFailedId(notificationId)
      }
    } finally {
      setMarkingId(null)
    }
  }

  let body: ReactNode
  if (!allowed) {
    body = <MessageCard title={N.NOT_AVAILABLE_TITLE} body={N.NOT_AVAILABLE_BODY} />
  } else if (isLoading) {
    body = <ListSkeleton />
  } else if (data) {
    if (data.total === 0) {
      body = <MessageCard title={N.EMPTY_TITLE} body={N.EMPTY_BODY} />
    } else {
      const totalPages = totalPagesOf(data.total, data.pageSize)
      const from = (data.page - 1) * data.pageSize + 1
      const to = from + data.notifications.length - 1

      body = (
        <>
          <ul
            aria-label={N.LIST_LABEL}
            aria-busy={isFetching}
            className={`divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white ${
              isFetching ? "opacity-60" : ""
            }`}
          >
            {data.notifications.map((item) => (
              <NotificationRow
                key={item.notificationId}
                item={item}
                marking={markingId === item.notificationId}
                failed={failedId === item.notificationId}
                onMarkRead={(id) => {
                  void handleMarkRead(id)
                }}
              />
            ))}
          </ul>

          <nav
            aria-label={N.PAGINATION_LABEL}
            className="mt-4 flex items-center justify-between gap-3"
          >
            <p className="text-sm text-slate-500" aria-live="polite">
              {N.PAGE_STATUS(from, to, data.total)}
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={data.page <= 1 || isFetching}
                onClick={() => setPage(data.page - 1)}
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                {N.PREVIOUS}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={data.page >= totalPages || isFetching}
                onClick={() => setPage(data.page + 1)}
              >
                {N.NEXT}
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          </nav>
        </>
      )
    }
  } else {
    body = (
      <MessageCard alert title={N.ERROR_TITLE} body={N.ERROR_BODY}>
        <Button type="button" variant="outline" size="sm" onClick={() => void refetch()}>
          {N.RETRY}
        </Button>
      </MessageCard>
    )
  }

  return (
    <section className="mx-auto w-full max-w-3xl py-6">
      <h1 className="text-2xl font-semibold text-slate-900">{N.PAGE_TITLE}</h1>
      <p className="mt-1 text-sm text-slate-500">{N.PAGE_SUBTITLE}</p>
      <div className="mt-6">{body}</div>
    </section>
  )
}
