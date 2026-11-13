import { useState, useRef, useEffect } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { fetchAddressSuggestions, type AddressSuggestion } from "@/services/addressService"
import { searchPageConstants as C } from "@/common/constants"

interface AddressAutocompleteProps {
  value: string
  onChange: (value: string) => void
  onSelectSuggestion: (suggestion: AddressSuggestion) => void
}

export default function AddressAutocomplete({
  value,
  onChange,
  onSelectSuggestion,
}: AddressAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const isLongEnough = value.trim().length >= C.MIN_ADDRESS_LENGTH

  useEffect(() => {
    if (!isLongEnough) return

    const timer = setTimeout(async () => {
      const results = await fetchAddressSuggestions(value)
      setSuggestions(results)
      setIsOpen(results.length > 0)
    }, C.SEARCH_DEBOUNCE_MS)

    return () => clearTimeout(timer)
  }, [value, isLongEnough])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSelect = (suggestion: AddressSuggestion) => {
    onChange(suggestion.description)
    setIsOpen(false)
    onSelectSuggestion(suggestion)
  }

  const showDropdown = isOpen && isLongEnough && suggestions.length > 0

  return (
    <div ref={containerRef} className="relative flex-1">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <Input
        placeholder={C.ADDRESS_PLACEHOLDER}
        className="border-0 pl-9 shadow-none focus-visible:ring-0"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => suggestions.length > 0 && setIsOpen(true)}
      />

      {showDropdown && (
        <ul className="absolute left-0 right-0 top-full z-20 mt-1 max-h-64 overflow-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
          {suggestions.map((suggestion) => (
            <li key={suggestion.placeId}>
              <button
                type="button"
                className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                onClick={() => handleSelect(suggestion)}
              >
                {suggestion.description}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}