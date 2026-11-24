import { ExternalLink } from "lucide-react"
import AddOpenHouseButton from "./addOpenHouseButton"
import SavePropertyButton from "./savePropertyButton"
import { propertyDetailsConstants as D } from "@/common/constants"

interface PropertyActionsProps {
  externalId: string
  listingUrl: string | null
  canSave: boolean
  // The open house chosen in the schedule; null when there is none to choose
  openHouseExternalId: string | null
}

export default function PropertyActions({
  externalId,
  listingUrl,
  canSave,
  openHouseExternalId,
}: PropertyActionsProps) {
  return (
    <div className="space-y-3">
      {canSave && (
        <AddOpenHouseButton
          key={openHouseExternalId ?? "none"}
          propertyExternalId={externalId}
          openHouseExternalId={openHouseExternalId}
        />
      )}
      {canSave && <SavePropertyButton externalId={externalId} />}
      {listingUrl && (
        <a
          href={listingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-9 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-center text-sm font-medium text-blue-600 hover:bg-slate-50"
        >
          <span>{D.OPEN_EXTERNAL}</span>
          <ExternalLink className="h-4 w-4 shrink-0" aria-hidden="true" />
        </a>
      )}
    </div>
  )
}
