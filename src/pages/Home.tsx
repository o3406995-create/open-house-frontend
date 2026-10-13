import { useState } from "react"
import SearchBar, { type SearchBarValues } from "@/components/search/searchBar"
import SearchFilterBar, { type FilterValues } from "@/components/search/searchFilterBar"
import MapPlaceholder from "@/components/search/mapPlaceholder"
import { useSearchPropertiesMutation } from "@/store/propertiesApi"
import { mockGeocode } from "@/utils/mockGeocode"
import heroImage from "@/assets/hero.jpg"
import { homePageConstants as C } from "@/common/constants"

export default function Home() {
  const [searchProperties, { data: properties = [], isLoading }] = useSearchPropertiesMutation()
  const [filters, setFilters] = useState<FilterValues>({})
  const [lastSearch, setLastSearch] = useState<SearchBarValues | null>(null)

  const runSearch = async (barValues: SearchBarValues, appliedFilters: FilterValues) => {
    const { latitude, longitude } = await mockGeocode(barValues.address)
    await searchProperties({
      latitude,
      longitude,
      radiusMeters: barValues.radiusMeters,
      ...appliedFilters,
    })
  }

  const handleSearch = (values: SearchBarValues) => {
    setLastSearch(values)
    runSearch(values, filters)
  }

  const handleFilterChange = (newFilters: FilterValues) => {
    const merged = { ...filters, ...newFilters }
    setFilters(merged)
    if (lastSearch) runSearch(lastSearch, merged)
  }

  return (
    <div className="relative">
      {/* Hero image */}
      <div
        className="flex h-[240px] flex-col justify-start bg-cover bg-center px-6 pt-4"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 top-0 h-[240px] bg-slate-900/40" />
        <div className="relative mx-auto w-full max-w-5xl">
          <p className="text-3xl font-bold text-white sm:text-4xl">
            {C.HERO_TITLE_LINE_1}
            <br />
            {C.HERO_TITLE_LINE_2}
          </p>
          <p className="mt-2 max-w-md text-sm text-white/90">
            {C.HERO_SUBTITLE}
          </p>
        </div>
      </div>

      {/* Map, explicit height = viewport - navbar - hero, no flex inheritance involved */}
      <div className="h-[calc(100vh-57px-240px)] min-h-[300px]">
        <MapPlaceholder properties={properties} />
      </div>

      {/* Floating card */}
      <div className="absolute left-1/2 top-[180px] z-10 w-full max-w-5xl -translate-x-1/2 px-6">
        <div className="rounded-2xl bg-white p-2 shadow-xl">
          <SearchBar onSearch={handleSearch} isLoading={isLoading} />
          <SearchFilterBar onChange={handleFilterChange} />
        </div>
      </div>
    </div>
  )
}