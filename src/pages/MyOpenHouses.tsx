import { useState, type ReactNode } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { List, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import MessageCard from "@/components/messageCard"
import MyOpenHouseRow from "@/components/myOpenHouses/myOpenHouseRow"
import {
  useGetMyOpenHousesQuery,
  useMarkMyOpenHouseAttendedMutation,
  useRemoveMyOpenHouseMutation,
  type MyOpenHouseGroup,
} from "@/store/propertiesApi"
import { errorStatus } from "@/utils/errorStatus"
import {
  getBrowserTimeZone,
  isNotFoundError,
  isNotStartedError,
  parseTab,
  pickDefaultTab,
} from "@/utils/myOpenHouses"
import {
  loginPageConstants as L,
  myOpenHousesConstants as C,
  propertyDetailsConstants as D,
  searchPageConstants as S,
} from "@/common/constants"

const PRIMARY_LINK_CLASS =
  "inline-flex h-9 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-700"

interface Busy {
  id: number
  action: "remove" | "mark"
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

export default function MyOpenHouses() {
  const [timeZone] = useState(getBrowserTimeZone)
  const [nowMs] = useState(() => Date.now())
  const [searchParams, setSearchParams] = useSearchParams()
  const [busy, setBusy] = useState<Busy | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  // Which group an open house is in depends on the time, so it is asked again every time the
  // page is opened
  const { data, error, isLoading, isFetching, refetch } = useGetMyOpenHousesQuery(timeZone, {
    refetchOnMountOrArgChange: true,
  })
  const [removeMyOpenHouse] = useRemoveMyOpenHouseMutation()
  const [markAttended] = useMarkMyOpenHouseAttendedMutation()

  const activeTab: MyOpenHouseGroup =
    parseTab(searchParams.get(C.TAB_PARAM)) ??
    (data ? pickDefaultTab(data.counts) : C.DEFAULT_TAB)

  const selectTab = (tab: MyOpenHouseGroup) => {
    const next = new URLSearchParams(searchParams)
    next.set(C.TAB_PARAM, tab)
    setSearchParams(next, { replace: true })
  }

  const handleRemove = async (id: number) => {
    setActionError(null)
    setBusy({ id, action: "remove" })
    try {
      await removeMyOpenHouse(id).unwrap()
    } catch (err) {
      // Not found means it is gone already (removed in another tab, or a double click)
      if (!isNotFoundError(err)) {
        setActionError(C.REMOVE_ERROR)
      }
    } finally {
      setBusy(null)
    }
  }

  const handleMarkAttended = async (id: number) => {
    setActionError(null)
    setBusy({ id, action: "mark" })
    try {
      await markAttended(id).unwrap()
    } catch (err) {
      if (isNotStartedError(err)) {
        setActionError(C.NOT_STARTED_ERROR)
      } else if (!isNotFoundError(err)) {
        setActionError(C.MARK_ERROR)
      }
    } finally {
      setBusy(null)
    }
  }

  let body: ReactNode
  if (isLoading) {
    body = <ListSkeleton />
  } else if (data) {
    const items = data.myOpenHouses[activeTab]
    const offersSearch = C.EMPTY_ACTION_GROUPS.some((group) => group === activeTab)

    body = (
      <>
        <div
          role="tablist"
          aria-label={C.TABS_LABEL}
          className="flex flex-wrap gap-2 border-b border-slate-200"
        >
          {C.TABS.map((tab) => {
            const selected = tab === activeTab

            return (
              <button
                key={tab}
                type="button"
                role="tab"
                id={C.TAB_ID(tab)}
                aria-selected={selected}
                aria-controls={C.PANEL_ID}
                onClick={() => selectTab(tab)}
                className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium transition ${
                  selected
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-600 hover:text-slate-900"
                }`}
              >
                {C.TAB_LABEL(C.GROUP_LABELS[tab], data.counts[tab])}
              </button>
            )
          })}
        </div>

        <div
          role="tabpanel"
          id={C.PANEL_ID}
          aria-labelledby={C.TAB_ID(activeTab)}
          className="mt-4"
        >
          {items.length === 0 ? (
            <MessageCard title={C.EMPTY_TITLES[activeTab]} body={C.EMPTY_BODIES[activeTab]}>
              {offersSearch && (
                <Link to={S.SEARCH_ROUTE} className={PRIMARY_LINK_CLASS}>
                  {C.EMPTY_ACTION}
                </Link>
              )}
            </MessageCard>
          ) : (
            <ul
              aria-label={C.LIST_LABEL}
              aria-busy={isFetching}
              className={`divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white ${
                isFetching ? "opacity-60" : ""
              }`}
            >
              {items.map((item) => (
                <MyOpenHouseRow
                  key={item.myOpenHouseId}
                  item={item}
                  nowMs={nowMs}
                  removing={busy?.id === item.myOpenHouseId && busy.action === "remove"}
                  marking={busy?.id === item.myOpenHouseId && busy.action === "mark"}
                  onRemove={(id) => {
                    void handleRemove(id)
                  }}
                  onMarkAttended={(id) => {
                    void handleMarkAttended(id)
                  }}
                />
              ))}
            </ul>
          )}
        </div>
      </>
    )
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
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div role="heading" aria-level={1} className="text-3xl font-semibold text-slate-900">
            {C.PAGE_TITLE}
          </div>
          <p className="mt-1 text-sm text-slate-500">{C.PAGE_SUBTITLE}</p>
        </div>

        <div role="group" aria-label={C.VIEW_TOGGLE_LABEL} className="flex gap-2">
          <Button
            type="button"
            size="sm"
            aria-pressed={true}
            className="gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <List className="h-4 w-4" aria-hidden="true" />
            {C.LIST_VIEW}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled
            title={D.COMING_SOON}
            aria-pressed={false}
            className="gap-2"
          >
            <MapPin className="h-4 w-4" aria-hidden="true" />
            {C.MAP_VIEW}
          </Button>
        </div>
      </div>

      {actionError && (
        <p role="alert" className="mt-4 text-sm text-red-600">
          {actionError}
        </p>
      )}

      <div className="mt-6">{body}</div>
    </div>
  )
}
