import { useState, type ReactNode } from "react"
import { Link } from "react-router-dom"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import SavedPropertyRow from "@/components/property/savedPropertyRow"
import NoteEditor from "@/components/notes/noteEditor"
import { savedPropertyTarget } from "@/utils/notes"
import { useGetSavedPropertiesQuery, useRemoveSavedPropertyMutation } from "@/store/propertiesApi"
import {
  loginPageConstants as L,
  savedPropertiesConstants as C,
  searchPageConstants as S,
} from "@/common/constants"

const PRIMARY_LINK_CLASS =
  "inline-flex h-9 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-700"

function errorStatus(error: unknown): number | null {
  if (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof error.status === "number"
  ) {
    return error.status
  }
  return null
}

interface MessageCardProps {
  title: string
  body?: string
  alert?: boolean
  children?: ReactNode
}

function MessageCard({ title, body, alert = false, children }: MessageCardProps) {
  return (
    <div
      role={alert ? "alert" : "status"}
      className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center"
    >
      <p className="text-lg font-semibold text-slate-900">{title}</p>
      {body && <p className="max-w-md text-sm text-slate-500">{body}</p>}
      {children}
    </div>
  )
}

function ListSkeleton() {
  return (
    <div
      role="status"
      aria-label={C.LOADING_LABEL}
      className="animate-pulse divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white"
    >
      {[0, 1, 2].map((key) => (
        <div key={key} className="flex items-center gap-4 p-4">
          <div className="h-14 w-20 rounded-lg bg-slate-200" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-1/2 rounded bg-slate-200" />
            <div className="h-3 w-1/3 rounded bg-slate-200" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function SavedProperties() {
  const [page, setPage] = useState(1)
  const [nowMs] = useState(() => Date.now())
  const [removingId, setRemovingId] = useState<number | null>(null)
  const [removeFailed, setRemoveFailed] = useState(false)

  const { data, error, isLoading, isFetching, refetch } = useGetSavedPropertiesQuery({
    page,
    pageSize: C.PAGE_SIZE,
  })
  const [removeSavedProperty] = useRemoveSavedPropertyMutation()

  const handleRemove = async (savedPropertyId: number) => {
    setRemoveFailed(false)
    setRemovingId(savedPropertyId)
    try {
      await removeSavedProperty(savedPropertyId).unwrap()
      // Removing the last item of a page would leave that page empty: step back one page
      if (data && data.savedProperties.length === 1 && page > 1) {
        setPage(page - 1)
      }
    } catch {
      setRemoveFailed(true)
    } finally {
      setRemovingId(null)
    }
  }

  let body: ReactNode
  if (isLoading) {
    body = <ListSkeleton />
  } else if (data) {
    if (data.total === 0) {
      body = (
        <MessageCard title={C.EMPTY_TITLE} body={C.EMPTY_BODY}>
          <Link to={S.SEARCH_ROUTE} className={PRIMARY_LINK_CLASS}>
            {C.EMPTY_ACTION}
          </Link>
        </MessageCard>
      )
    } else {
      const totalPages = Math.max(1, Math.ceil(data.total / data.pageSize))
      const from = (data.page - 1) * data.pageSize + 1
      const to = from + data.savedProperties.length - 1

      body = (
        <>
          <ul
            aria-label={C.LIST_LABEL}
            aria-busy={isFetching}
            className={`divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white ${
              isFetching ? "opacity-60" : ""
            }`}
          >
            {data.savedProperties.map((item) => (
              <SavedPropertyRow
                key={item.savedPropertyId}
                item={item}
                nowMs={nowMs}
                removing={removingId === item.savedPropertyId}
                onRemove={(id) => {
                  void handleRemove(id)
                }}
                footer={
                  <NoteEditor
                    target={savedPropertyTarget(item.savedPropertyId)}
                    note={item.note}
                    subject={item.property.address}
                  />
                }
              />
            ))}
          </ul>

          {totalPages > 1 && (
            <nav
              aria-label={C.PAGINATION_LABEL}
              className="mt-4 flex items-center justify-between text-sm text-slate-600"
            >
              <span>{C.PAGE_RANGE(from, to, data.total)}</span>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={page <= 1 || isFetching}
                  onClick={() => setPage(page - 1)}
                >
                  <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                  {C.PREVIOUS}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages || isFetching}
                  onClick={() => setPage(page + 1)}
                >
                  {C.NEXT}
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            </nav>
          )}
        </>
      )
    }
  } else {
    const status = errorStatus(error)
    if (status === C.STATUS_UNAUTHORIZED) {
      body = (
        <MessageCard title={C.LOGIN_REQUIRED_TITLE}>
          <Link to={L.LOGIN_ROUTE} className={PRIMARY_LINK_CLASS}>
            {C.LOGIN_ACTION}
          </Link>
        </MessageCard>
      )
    } else if (status === C.STATUS_FORBIDDEN) {
      body = <MessageCard title={C.USER_ONLY_TITLE} body={C.USER_ONLY_BODY} />
    } else {
      body = (
        <MessageCard alert title={C.ERROR_TITLE} body={C.ERROR_BODY}>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              void refetch()
            }}
          >
            {C.RETRY}
          </Button>
        </MessageCard>
      )
    }
  }

  return (
    <div className="mx-auto w-full max-w-7xl py-4">
      <div role="heading" aria-level={1} className="text-3xl font-semibold text-slate-900">
        {C.PAGE_TITLE}
      </div>
      <p className="mt-1 text-sm text-slate-500">{C.PAGE_SUBTITLE}</p>

      {removeFailed && (
        <p role="alert" className="mt-4 text-sm text-red-600">
          {C.REMOVE_ERROR}
        </p>
      )}

      <div className="mt-6">{body}</div>
    </div>
  )
}