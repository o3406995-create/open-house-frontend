import { useState, useRef } from "react"
import SearchBar, { type SearchBarValues } from "@/components/search/searchBar"
import SearchFilterBar, { type FilterValues } from "@/components/search/searchFilterBar"
import MapPlaceholder from "@/components/search/mapPlaceholder"
import { useSearchPropertiesMutation } from "@/store/propertiesApi"
import { mockGeocode } from "@/utils/mockGeocode"
import heroImage from "@/assets/hero.jpg"
import { homePageConstants as C } from "@/common/constants"

interface MapCenter {
  lat: number
  lng: number
}

export default function Home() {
  const [searchProperties, { data: properties = [] }] = useSearchPropertiesMutation()
  const [filters, setFilters] = useState<FilterValues>({})
  const [lastSearch, setLastSearch] = useState<SearchBarValues | null>(null)
  const [mapCenter, setMapCenter] = useState<MapCenter | null>(C.DEFAULT_MAP_CENTER)
  const [mapRadiusMeters, setMapRadiusMeters] = useState(C.DEFAULT_RADIUS_METERS)
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState("")
  const lastSearchAtRef = useRef(0)

  const runSearch = async (barValues: SearchBarValues, appliedFilters: FilterValues) => {
    const now = Date.now()
    if (now - lastSearchAtRef.current < C.SEARCH_DEBOUNCE_MS) {
      return
    }
    lastSearchAtRef.current = now

    setIsSearching(true)
    setSearchError("")
    const startedAt = Date.now()

    try {
      const { latitude, longitude } = await mockGeocode(barValues.address)

      setMapCenter({ lat: latitude, lng: longitude })
      setMapRadiusMeters(barValues.radiusMeters)

      await searchProperties({
        latitude,
        longitude,
        radiusMeters: barValues.radiusMeters,
        ...appliedFilters,
      }).unwrap()
    } catch {
      setSearchError("Search failed. Please try again.")
    } finally {
      const elapsed = Date.now() - startedAt
      if (elapsed < C.MIN_LOADING_MS) {
        await new Promise((resolve) => setTimeout(resolve, C.MIN_LOADING_MS - elapsed))
      }
      setIsSearching(false)
    }
  }

  const handleSearch = (values: SearchBarValues) => {
    setLastSearch(values)
    runSearch(values, filters)
  }

  const handleFilterChange = (newFilters: FilterValues) => {
    setFilters(newFilters)
    if (lastSearch) runSearch(lastSearch, newFilters)
  }

  return (
    <div className="relative">
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
          <p className="mt-2 max-w-md text-sm text-white/90">{C.HERO_SUBTITLE}</p>
        </div>
      </div>

      <div className="h-[calc(100vh-57px-240px)] min-h-[300px]">
        <MapPlaceholder
          properties={properties}
          center={mapCenter ?? undefined}
          radiusMeters={mapRadiusMeters}
        />
      </div>

      <div className="absolute left-1/2 top-[180px] z-10 w-full max-w-5xl -translate-x-1/2 px-6">
        <div className="rounded-2xl bg-white p-2 shadow-xl">
          <SearchBar onSearch={handleSearch} isLoading={isSearching} />
          <SearchFilterBar onChange={handleFilterChange} />
        </div>
        {searchError && (
          <p className="mt-2 rounded-lg bg-white px-3 py-2 text-sm text-red-600 shadow">
            {searchError}
          </p>
        )}
      </div>
    </div>
  )
}