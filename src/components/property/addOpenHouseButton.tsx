import { useState } from "react"
import { CalendarPlus, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  useAddMyOpenHouseMutation,
  useGetMyOpenHousesQuery,
  useRemoveMyOpenHouseMutation,
} from "@/store/propertiesApi"
import {
  addErrorMessage,
  entryIdFor,
  findEntry,
  type LastAction,
} from "@/utils/addedOpenHouse"
import { getBrowserTimeZone, isNotFoundError } from "@/utils/myOpenHouses"
import { myOpenHousesConstants as C, propertyDetailsConstants as D } from "@/common/constants"

interface AddOpenHouseButtonProps {
  propertyExternalId: string
  // The open house chosen in the schedule; null when there is none to choose
  openHouseExternalId: string | null
}

const BASE_CLASS = "h-auto min-h-9 w-full justify-center gap-2 px-3 py-2"

// Adds the chosen open house to My Open Houses, or removes it when it is there already.
// Adding twice is harmless (the backend answers 200 with the existing entry), which is also
// how an open house the list did not show becomes known to the button. The parent gives the
// button a key per open house, so choosing another time starts it afresh.
export default function AddOpenHouseButton({
  propertyExternalId,
  openHouseExternalId,
}: AddOpenHouseButtonProps) {
  const [timeZone] = useState(getBrowserTimeZone)
  const { data, isLoading } = useGetMyOpenHousesQuery(timeZone, {
    skip: openHouseExternalId === null,
  })
  const [addMyOpenHouse] = useAddMyOpenHouseMutation()
  const [removeMyOpenHouse] = useRemoveMyOpenHouseMutation()
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [lastAction, setLastAction] = useState<LastAction | null>(null)

  if (openHouseExternalId === null) {
    return (
      <Button
        type="button"
        disabled
        title={C.NO_OPEN_HOUSE_HINT}
        className={`${BASE_CLASS} bg-blue-600`}
      >
        <CalendarPlus className="h-4 w-4" aria-hidden="true" />
        <span>{D.ADD_OPEN_HOUSE}</span>
      </Button>
    )
  }

  const entryId = entryIdFor(
    lastAction,
    findEntry(data, propertyExternalId, openHouseExternalId),
  )
  const added = entryId !== null

  const handleClick = async () => {
    setMessage(null)
    setBusy(true)
    try {
      if (entryId !== null) {
        try {
          await removeMyOpenHouse(entryId).unwrap()
        } catch (err) {
          // Not found means it is gone already (removed in another tab, or a double click)
          if (!isNotFoundError(err)) throw err
        }
        setLastAction({ myOpenHouseId: null })
      } else {
        const result = await addMyOpenHouse({ propertyExternalId, openHouseExternalId }).unwrap()
        setLastAction({ myOpenHouseId: result.myOpenHouseId })
      }
    } catch (err) {
      setMessage(entryId !== null ? C.REMOVE_ERROR : addErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <Button
        type="button"
        variant={added ? "outline" : "default"}
        disabled={isLoading || busy}
        aria-busy={busy}
        title={added ? C.ADDED_HINT : undefined}
        onClick={() => {
          void handleClick()
        }}
        className={`${BASE_CLASS} ${
          added
            ? "border-green-600 bg-green-50 text-green-700 hover:bg-green-100"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {added ? (
          <Check className="h-4 w-4" aria-hidden="true" />
        ) : (
          <CalendarPlus className="h-4 w-4" aria-hidden="true" />
        )}
        <span>{added ? C.ADDED : D.ADD_OPEN_HOUSE}</span>
      </Button>
      {message && (
        <p role="alert" className="mt-2 text-xs text-red-600">
          {message}
        </p>
      )}
    </div>
  )
}
