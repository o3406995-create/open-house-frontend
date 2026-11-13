import { Bookmark, ExternalLink } from "lucide-react"
import ComingSoonButton from "./comingSoonButton"
import { propertyDetailsConstants as D } from "@/common/constants"

interface PropertyActionsProps {
  listingUrl: string | null
  canSave: boolean
}

export default function PropertyActions({ listingUrl, canSave }: PropertyActionsProps) {
  return (
    <div className="space-y-3">
      {canSave && <ComingSoonButton primary label={D.ADD_OPEN_HOUSE} />}
      {canSave && (
        <ComingSoonButton
          label={D.SAVE_PROPERTY}
          icon={<Bookmark className="h-4 w-4" aria-hidden="true" />}
        />
      )}
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