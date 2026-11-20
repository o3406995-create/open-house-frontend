import { useState } from "react"
import { Bookmark } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  useGetSavedPropertiesQuery,
  useRemoveSavedPropertyMutation,
  useSavePropertyMutation,
} from "@/store/propertiesApi"
import { propertyDetailsConstants as D, savedPropertiesConstants as C } from "@/common/constants"

interface SavePropertyButtonProps {
  externalId: string
}

// Saves or un-saves one property. Saving twice is harmless (the backend answers 200 for a
// property that is already saved), so the button stays usable even if the list cannot load.
export default function SavePropertyButton({ externalId }: SavePropertyButtonProps) {
  const { data, isLoading } = useGetSavedPropertiesQuery({
    page: 1,
    pageSize: C.LOOKUP_PAGE_SIZE,
  })
  const [saveProperty, { isLoading: saving }] = useSavePropertyMutation()
  const [removeSavedProperty, { isLoading: removing }] = useRemoveSavedPropertyMutation()
  const [failed, setFailed] = useState(false)

  const saved = data?.savedProperties.find((item) => item.property.externalId === externalId)
  const busy = saving || removing

  const handleClick = async () => {
    setFailed(false)
    try {
      if (saved) {
        await removeSavedProperty(saved.savedPropertyId).unwrap()
      } else {
        await saveProperty(externalId).unwrap()
      }
    } catch {
      setFailed(true)
    }
  }

  return (
    <div>
      <Button
        type="button"
        variant="outline"
        disabled={isLoading || busy}
        aria-busy={busy}
        title={saved ? C.SAVED_HINT : undefined}
        onClick={() => {
          void handleClick()
        }}
        className={`h-auto min-h-9 w-full justify-center gap-2 px-3 py-2 ${
          saved
            ? "border-blue-600 bg-blue-50 text-blue-700"
            : "border-blue-200 text-blue-600"
        }`}
      >
        <Bookmark className={`h-4 w-4 ${saved ? "fill-current" : ""}`} aria-hidden="true" />
        <span>{saved ? C.SAVED : D.SAVE_PROPERTY}</span>
      </Button>
      {failed && (
        <p role="alert" className="mt-2 text-xs text-red-600">
          {C.SAVE_ERROR}
        </p>
      )}
    </div>
  )
}