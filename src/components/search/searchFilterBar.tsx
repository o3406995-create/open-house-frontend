import { useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { ChevronDown, SlidersHorizontal, Check } from "lucide-react"
import { searchPageConstants as C } from "@/common/constants"

export interface FilterValues {
  minPrice?: number
  maxPrice?: number
  minBedrooms?: number
  minBathrooms?: number
  propertyType?: string
  auctionOnly?: boolean
}

interface SearchFilterBarProps {
  onChange: (filters: FilterValues) => void
}

const BEDROOM_OPTIONS = [1, 2, 3, 4, 5]
const PROPERTY_TYPES = ["House", "Apartment", "Townhouse"]

const PRICE_OPTIONS = [
  { label: C.PRICE_UNDER_500K, minPrice: undefined, maxPrice: 500000 },
  { label: C.PRICE_500K_1M, minPrice: 500000, maxPrice: 1000000 },
  { label: C.PRICE_OVER_1M, minPrice: 1000000, maxPrice: undefined },
]

function pillClass(isActive: boolean) {
  return isActive
    ? "rounded-full border-blue-500 bg-blue-50 text-blue-700"
    : "rounded-full border-slate-200 text-slate-600"
}

export default function SearchFilterBar({ onChange }: SearchFilterBarProps) {
  const [priceLabel, setPriceLabel] = useState<string | null>(null)
  const [bedroomsLabel, setBedroomsLabel] = useState<string | null>(null)
  const [bathroomsLabel, setBathroomsLabel] = useState<string | null>(null)
  const [propertyTypeLabel, setPropertyTypeLabel] = useState<string | null>(null)
  const [auctionOnly, setAuctionOnly] = useState(false)
  const [filters, setFiltersState] = useState<FilterValues>({})

  const apply = (partial: FilterValues) => {
    const next = { ...filters, ...partial }
    setFiltersState(next)
    onChange(next)
  }

  return (
    <div className="mt-2 flex flex-wrap gap-2 border-t border-slate-100 pt-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className={pillClass(!!priceLabel)}>
            {priceLabel ?? C.FILTER_PRICE} <ChevronDown className="ml-1 h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {PRICE_OPTIONS.map((opt) => (
            <DropdownMenuItem
              key={opt.label}
              onClick={() => {
                setPriceLabel(opt.label)
                apply({ minPrice: opt.minPrice, maxPrice: opt.maxPrice })
              }}
            >
              {opt.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className={pillClass(!!bedroomsLabel)}>
            {bedroomsLabel ?? C.FILTER_BEDROOMS} <ChevronDown className="ml-1 h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {BEDROOM_OPTIONS.map((n) => (
            <DropdownMenuItem
              key={n}
              onClick={() => {
                setBedroomsLabel(`${n}${C.BEDROOMS_SUFFIX}`)
                apply({ minBedrooms: n })
              }}
            >
              {n}{C.BEDROOMS_SUFFIX}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className={pillClass(!!bathroomsLabel)}>
            {bathroomsLabel ?? C.FILTER_BATHROOMS} <ChevronDown className="ml-1 h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {[1, 2, 3].map((n) => (
            <DropdownMenuItem
              key={n}
              onClick={() => {
                setBathroomsLabel(`${n}${C.BATHROOMS_SUFFIX}`)
                apply({ minBathrooms: n })
              }}
            >
              {n}{C.BATHROOMS_SUFFIX}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className={pillClass(!!propertyTypeLabel)}>
            {propertyTypeLabel ?? C.FILTER_PROPERTY_TYPE} <ChevronDown className="ml-1 h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {PROPERTY_TYPES.map((type) => (
            <DropdownMenuItem
              key={type}
              onClick={() => {
                setPropertyTypeLabel(type)
                apply({ propertyType: type })
              }}
            >
              {type}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        variant="outline"
        size="sm"
        className={pillClass(auctionOnly)}
        onClick={() => {
          const next = !auctionOnly
          setAuctionOnly(next)
          apply({ auctionOnly: next || undefined })
        }}
      >
        {auctionOnly && <Check className="mr-1 h-3 w-3" />}
        {C.FILTER_AUCTION}
      </Button>

      <Button variant="outline" size="sm" className="rounded-full border-slate-200 text-slate-600">
        <SlidersHorizontal className="mr-1 h-3 w-3" /> {C.FILTER_MORE}
      </Button>
    </div>
  )
}