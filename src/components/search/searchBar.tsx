import { useState, type FormEvent } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { homePageConstants as C } from "@/common/constants"

export interface SearchBarValues {
  address: string
  radiusMeters: number
  dateRange: string
}

interface SearchBarProps {
  onSearch: (values: SearchBarValues) => void
  isLoading: boolean
}

export default function SearchBar({ onSearch, isLoading }: SearchBarProps) {
  const [address, setAddress] = useState("")
  const [radiusMeters, setRadiusMeters] = useState(5000)
  const [dateRange, setDateRange] = useState("any")

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    onSearch({ address, radiusMeters, dateRange })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-2 rounded-2xl bg-white p-2 shadow-lg sm:flex-row sm:items-center"
    >
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          placeholder={C.ADDRESS_PLACEHOLDER}
          className="border-0 pl-9 shadow-none focus-visible:ring-0"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
      </div>

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

      <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
        {isLoading ? C.SEARCHING : C.SEARCH_BUTTON}
      </Button>
    </form>
  )
}