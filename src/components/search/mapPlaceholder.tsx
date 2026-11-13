import { useJsApiLoader } from "@react-google-maps/api"
import { Users } from "lucide-react"
import type { PropertyDTO } from "@/store/propertiesApi"
import { searchPageConstants as C } from "@/common/constants"
import MapView from "./mapView"

interface mapPlaceholderProps {
  properties: PropertyDTO[]
  center?: { lat: number; lng: number }
  radiusMeters?: number
}

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

export default function MapPlaceholder({
  properties,
  center,
  radiusMeters = C.DEFAULT_RADIUS_METERS,
}: mapPlaceholderProps) {
  const safeProperties = Array.isArray(properties) ? properties : []
  const withOpenHouse = safeProperties.filter((p) => p.openHouses.length > 0).length
  const withoutOpenHouse = safeProperties.length - withOpenHouse

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY ?? "",
    id: "google-map-script",
    libraries: C.GOOGLE_MAPS_LIBRARIES,
  })

  const canRenderRealMap = Boolean(GOOGLE_MAPS_API_KEY) && isLoaded && center

  return (
    <div className="relative h-full overflow-hidden bg-slate-100">
      {canRenderRealMap ? (
        <MapView properties={safeProperties} center={center!} radiusMeters={radiusMeters} />
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-2 pt-[130px] text-slate-400">
          <p className="text-sm font-medium">{C.MAP_COMING_SOON}</p>
          <p className="text-xs">
            {safeProperties.length > 0
              ? C.MAP_RESULTS_FOUND(safeProperties.length)
              : C.MAP_EMPTY_HINT}
          </p>
        </div>
      )}

      <div className="absolute bottom-8 left-4 flex gap-4 rounded-xl bg-white px-4 py-2 text-xs shadow">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
          {C.LEGEND_OPEN_HOUSE} ({withOpenHouse})
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
          {C.LEGEND_NO_OPEN_HOUSE} ({withoutOpenHouse})
        </div>
      </div>

      <button className="absolute bottom-8 right-4 flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-medium text-white shadow hover:bg-blue-700">
        <Users className="h-3.5 w-3.5" />
        {C.FIND_AGENTS_BUTTON}
      </button>
    </div>
  )
}