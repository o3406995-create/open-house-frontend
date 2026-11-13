import { useState, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import AddressAutocomplete from "./addressAutocomplete"
import { geocodeSelectedPlace, geocodeFreeTextAddress, type AddressSuggestion } from "@/services/addressService"
import { searchPageConstants as C } from "@/common/constants"

export interface SearchBarValues {
  address: string
  latitude: number
  longitude: number
  radiusMeters: number
  dateRange: string
}

interface SearchBarProps {
  onSearch: (values: SearchBarValues) => void
  isLoading: boolean
}

const ADDRESS_PATTERN = /^[a-zA-Z0-9\s,.'/-]*$/

export default function SearchBar({ onSearch, isLoading }: SearchBarProps) {
  const [address, setAddress] = useState("")
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null)
  const [radiusMeters, setRadiusMeters] = useState(C.DEFAULT_RADIUS_METERS)
  const [dateRange, setDateRange] = useState("any")
  const [validationError, setValidationError] = useState("")

  const handleAddressChange = (value: string) => {
    setAddress(value)
    setSelectedPlaceId(null)
  }

  const handleSelectSuggestion = (suggestion: AddressSuggestion) => {
    setSelectedPlaceId(suggestion.placeId)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    const trimmed = address.trim()
    const isValid =
      trimmed.length >= C.MIN_ADDRESS_LENGTH && ADDRESS_PATTERN.test(trimmed)

    if (!isValid) {
      setValidationError(C.SEARCH_ERROR_INVALID)
      return
    }

    setValidationError("")

    const { latitude, longitude } = selectedPlaceId
      ? await geocodeSelectedPlace(selectedPlaceId, trimmed)
      : await geocodeFreeTextAddress(trimmed)

    onSearch({ address: trimmed, latitude, longitude, radiusMeters, dateRange })
  }

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-2 rounded-2xl bg-white p-2 shadow-lg sm:flex-row sm:items-center"
      >
        <AddressAutocomplete
          value={address}
          onChange={handleAddressChange}
          onSelectSuggestion={handleSelectSuggestion}
        />

        <Select value={String(radiusMeters)} onValueChange={(v) => setRadiusMeters(Number(v))}>
          <SelectTrigger className="w-full border-0 shadow-none sm:w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1000">{C.RADIUS_1KM}</SelectItem>
            <SelectItem value="2000">{C.RADIUS_2KM}</SelectItem>
            <SelectItem value="5000">{C.RADIUS_5KM}</SelectItem>
            <SelectItem value="10000">{C.RADIUS_10KM}</SelectItem>
          </SelectContent>
        </Select>

        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-full border-0 shadow-none sm:w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">{C.DATE_ANY}</SelectItem>
            <SelectItem value="today">{C.DATE_TODAY}</SelectItem>
            <SelectItem value="weekend">{C.DATE_WEEKEND}</SelectItem>
            <SelectItem value="week">{C.DATE_WEEK}</SelectItem>
          </SelectContent>
        </Select>

        <Button
          type="submit"
          style={{ width: `${C.SEARCH_BUTTON_WIDTH_PX}px` }}
          className="shrink-0 bg-blue-600 hover:bg-blue-700"
          disabled={isLoading}
        >
          {isLoading ? C.SEARCHING : C.SEARCH_BUTTON}
        </Button>
      </form>

      {validationError && (
        <p className="mt-2 px-2 text-sm text-red-600">{validationError}</p>
      )}
    </div>
  )
}