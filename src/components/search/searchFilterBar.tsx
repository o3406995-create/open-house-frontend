import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { ChevronDown, SlidersHorizontal } from "lucide-react"
import { homePageConstants as C } from "@/common/constants"

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

export default function SearchFilterBar({ onChange }: SearchFilterBarProps) {
  return (
    <div className="mt-2 flex flex-wrap gap-2 border-t border-slate-100 pt-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full border-slate-200 text-slate-600"
          >
            {C.FILTER_PRICE} <ChevronDown className="ml-1 h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => onChange({ maxPrice: 500000 })}>
            {C.PRICE_UNDER_500K}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onChange({ minPrice: 500000, maxPrice: 1000000 })}>
            {C.PRICE_500K_1M}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onChange({ minPrice: 1000000 })}>
            {C.PRICE_OVER_1M}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full border-slate-200 text-slate-600"
          >
            {C.FILTER_BEDROOMS} <ChevronDown className="ml-1 h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {BEDROOM_OPTIONS.map((n) => (
            <DropdownMenuItem key={n} onClick={() => onChange({ minBedrooms: n })}>
              {n}{C.BEDROOMS_SUFFIX}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full border-slate-200 text-slate-600"
          >
            {C.FILTER_BATHROOMS} <ChevronDown className="ml-1 h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {[1, 2, 3].map((n) => (
            <DropdownMenuItem key={n} onClick={() => onChange({ minBathrooms: n })}>
              {n}{C.BATHROOMS_SUFFIX}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full border-slate-200 text-slate-600"
          >
            {C.FILTER_PROPERTY_TYPE} <ChevronDown className="ml-1 h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {PROPERTY_TYPES.map((type) => (
            <DropdownMenuItem key={type} onClick={() => onChange({ propertyType: type })}>
              {type}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        variant="outline"
        size="sm"
        className="rounded-full border-slate-200 text-slate-600"
        onClick={() => onChange({ auctionOnly: true })}
      >
        {C.FILTER_AUCTION} <ChevronDown className="ml-1 h-3 w-3" />
      </Button>

      <Button
        variant="outline"
        size="sm"
        className="rounded-full border-slate-200 text-slate-600"
      >
        <SlidersHorizontal className="mr-1 h-3 w-3" /> {C.FILTER_MORE}
      </Button>
    </div>
  )
}