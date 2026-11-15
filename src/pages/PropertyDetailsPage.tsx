import { useState, type ReactNode } from "react"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAppSelector } from "@/store/hooks"
import { useGetPropertyByIdQuery, type PropertyDetailDTO } from "@/store/propertiesApi"
import { getUpcomingOpenHouses } from "@/utils/formatOpenHouse"
import PropertyGallery from "@/components/property/propertyGallery"
import PropertySummary from "@/components/property/propertySummary"
import OpenHouseSchedule from "@/components/property/openHouseSchedule"
import ListingAgentCard from "@/components/property/listingAgentCard"
import PropertyActions from "@/components/property/propertyActions"
import PropertyDescription from "@/components/property/propertyDescription"
import { propertyDetailsConstants as D, searchPageConstants as S } from "@/common/constants"

function isNotFound(error: unknown): boolean {
  if (typeof error !== "object" || error === null || !("status" in error)) return false
  // The backend answers 400 for malformed ids and 404 for unknown ones
  return error.status === 404 || error.status === 400
}

function DetailsSkeleton() {
  return (
    <div
      role="status"
      aria-label={D.LOADING_LABEL}
      className="grid animate-pulse gap-6 lg:grid-cols-3"
    >
      <div className="aspect-[4/3] rounded-xl bg-slate-200" />
      <div className="space-y-4">
        <div className="h-8 w-3/4 rounded bg-slate-200" />
        <div className="h-4 w-1/2 rounded bg-slate-200" />
        <div className="h-32 rounded-xl bg-slate-200" />
      </div>
      <div className="space-y-4">
        <div className="h-40 rounded-xl bg-slate-200" />
        <div className="h-9 rounded-lg bg-slate-200" />
      </div>
    </div>
  )
}

interface MessageStateProps {
  title: string
  body: string
  actionLabel?: string
  onAction?: () => void
}

function MessageState({ title, body, actionLabel, onAction }: MessageStateProps) {
  return (
    <div role="alert" className="flex flex-col items-center gap-3 py-20 text-center">
      <p className="text-lg font-semibold text-slate-900">{title}</p>
      <p className="max-w-md text-sm text-slate-500">{body}</p>
      {actionLabel && onAction && (
        <Button type="button" variant="outline" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  )
}

function PropertyDetailsContent({ property }: { property: PropertyDetailDTO }) {
  const role = useAppSelector((state) => state.auth.user?.role)
  const [nowMs] = useState(() => Date.now())
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const upcoming = getUpcomingOpenHouses(property.openHouses, nowMs)
  const selectable = upcoming.filter(
    (openHouse) => openHouse.status === D.OPEN_HOUSE_STATUS_SCHEDULED,
  )
  // Defaults to the first selectable open house when nothing valid is selected
  const effectiveSelectedId =
    selectable.find((openHouse) => openHouse.externalId === selectedId)?.externalId ??
    selectable[0]?.externalId ??
    null

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,0.8fr)]">
        <PropertyGallery images={property.images} address={property.address} />

        <div className="space-y-6">
          <PropertySummary property={property} />
          <OpenHouseSchedule
            openHouses={upcoming}
            selectedId={effectiveSelectedId}
            onSelect={setSelectedId}
          />
        </div>

        <div className="space-y-4">
          {property.agent && <ListingAgentCard agent={property.agent} />}
          <PropertyActions listingUrl={property.listingUrl} canSave={role === D.ROLE_USER} />
        </div>
      </div>

      <PropertyDescription
        description={property.description}
        propertyType={property.propertyType}
        landSizeSqm={property.landSizeSqm}
      />
    </>
  )
}

export default function PropertyDetailsPage() {
  const { externalId = "" } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { data: property, error, isLoading, refetch } = useGetPropertyByIdQuery(externalId, {
    skip: externalId === "",
  })

  // The first location of a session has no history to go back to
  const goBack = () => {
    if (location.key !== D.INITIAL_LOCATION_KEY) {
      navigate(-1)
    } else {
      navigate(S.SEARCH_ROUTE)
    }
  }

  let body: ReactNode
  if (isLoading) {
    body = <DetailsSkeleton />
  } else if (property) {
    body = <PropertyDetailsContent key={property.externalId} property={property} />
  } else if (isNotFound(error)) {
    body = <MessageState title={D.NOT_FOUND_TITLE} body={D.NOT_FOUND_BODY} />
  } else {
    body = (
      <MessageState
        title={D.ERROR_TITLE}
        body={D.ERROR_BODY}
        actionLabel={D.RETRY}
        onAction={() => {
          void refetch()
        }}
      />
    )
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-6">
      <button
        type="button"
        onClick={goBack}
        className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        {D.BACK_TO_SEARCH}
      </button>

      <div className="mt-4">{body}</div>
    </div>
  )
}