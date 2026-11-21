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

interface SavedState {
  saved: boolean
  savedPropertyId: number | null
}

// Saves or un-saves one property. The list only covers the first LOOKUP_PAGE_SIZE saved
// properties and may fail to load, so what this button last did wins over the list. Saving
// twice is harmless (the backend answers 200 for a property that is already saved), which
// is also how a property outside the list becomes known to the button.
export default function SavePropertyButton({ externalId }: SavePropertyButtonProps) {
  const { data, isLoading } = useGetSavedPropertiesQuery({
    page: 1,
    pageSize: C.LOOKUP_PAGE_SIZE,
  })
  const [saveProperty, { isLoading: saving }] = useSavePropertyMutation()
  const [removeSavedProperty, { isLoading: removing }] = useRemoveSavedPropertyMutation()
  const [failed, setFailed] = useState(false)
  const [lastAction, setLastAction] = useState<SavedState | null>(null)

  const fromList = data?.savedProperties.find((item) => item.property.externalId === externalId)
  const current: SavedState = lastAction ?? {
    saved: fromList !== undefined,
    savedPropertyId: fromList?.savedPropertyId ?? null,
  }
  const busy = saving || removing

  const handleClick = async () => {
    setFailed(false)
    try {
      if (current.saved && current.savedPropertyId !== null) {
        await removeSavedProperty(current.savedPropertyId).unwrap()
        setLastAction({ saved: false, savedPropertyId: null })
      } else {
        const result = await saveProperty(externalId).unwrap()
        setLastAction({ saved: true, savedPropertyId: result.savedPropertyId })
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
        title={current.saved ? C.SAVED_HINT : undefined}
        onClick={() => {
          void handleClick()
        }}
        className={`h-auto min-h-9 w-full justify-center gap-2 px-3 py-2 ${
          current.saved
            ? "border-blue-600 bg-blue-50 text-blue-700"
            : "border-blue-200 text-blue-600"
        }`}
      >
        <Bookmark className={`h-4 w-4 ${current.saved ? "fill-current" : ""}`} aria-hidden="true" />
        <span>{current.saved ? C.SAVED : D.SAVE_PROPERTY}</span>
      </Button>
      {failed && (
        <p role="alert" className="mt-2 text-xs text-red-600">
          {C.SAVE_ERROR}
        </p>
      )}
    </div>
  )
}
