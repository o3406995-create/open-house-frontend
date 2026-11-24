import { useState } from "react"
import { Link } from "react-router-dom"
import { GoogleMap, InfoWindow, Marker, useJsApiLoader } from "@react-google-maps/api"
import MessageCard from "@/components/messageCard"
import type { MyOpenHouseItemDTO } from "@/store/propertiesApi"
import { formatOpenHouseDate, formatOpenHouseTime } from "@/utils/formatOpenHouse"
import { buildMapData, getBounds } from "@/utils/myOpenHousesMap"
import {
  myOpenHousesConstants as C,
  propertyDetailsConstants as D,
  searchPageConstants as S,
} from "@/common/constants"

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

// Local dev only, the same switch the search page uses
const ALLOW_KEYLESS_DEV_MAP =
  import.meta.env.DEV && import.meta.env.VITE_GOOGLE_MAPS_KEYLESS_DEV === "true"

const mapOptions: google.maps.MapOptions = {
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: false,
}

interface MyOpenHousesMapProps {
  items: MyOpenHouseItemDTO[]
}

// The parent gives this a key per tab, so each tab gets its own map that starts out showing
// all of that tab's markers
export default function MyOpenHousesMap({ items }: MyOpenHousesMapProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [initial] = useState(() => {
    const first = buildMapData(items).markers[0]
    return first ? { lat: first.latitude, lng: first.longitude } : null
  })

  // The same arguments as on the search page: the script must not be loaded twice
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY ?? "",
    id: "google-map-script",
    libraries: S.GOOGLE_MAPS_LIBRARIES,
  })

  const { markers, withoutLocation } = buildMapData(items)

  if (markers.length === 0) {
    return (
      <MessageCard title={C.MAP_NO_LOCATION_TITLE} body={C.MAP_NO_LOCATION_BODY} />
    )
  }

  const hasKey = Boolean(GOOGLE_MAPS_API_KEY) || ALLOW_KEYLESS_DEV_MAP
  if (!hasKey || loadError) {
    return <MessageCard title={C.MAP_UNAVAILABLE_TITLE} body={C.MAP_UNAVAILABLE_BODY} />
  }
  if (!isLoaded || !initial) {
    return <MessageCard title={C.MAP_LOADING} />
  }

  const selected = markers.find((marker) => marker.propertyExternalId === selectedId) ?? null
  const activeCount = markers.filter((marker) => marker.active).length

  const handleLoad = (map: google.maps.Map) => {
    const bounds = getBounds(markers)
    if (!bounds) return

    if (markers.length === 1) {
      map.setCenter(initial)
      map.setZoom(S.DEFAULT_MAP_ZOOM)
      return
    }
    map.fitBounds(bounds, C.MAP_PADDING)
  }

  return (
    <section
      aria-label={C.MAP_LABEL}
      className="relative h-[60vh] min-h-[360px] overflow-hidden rounded-xl border border-slate-200 bg-slate-100"
    >
      <GoogleMap
        mapContainerClassName="h-full w-full"
        center={initial}
        zoom={S.DEFAULT_MAP_ZOOM}
        options={mapOptions}
        onLoad={handleLoad}
      >
        {markers.map((marker) => (
          <Marker
            key={marker.propertyExternalId}
            position={{ lat: marker.latitude, lng: marker.longitude }}
            icon={{
              path: window.google.maps.SymbolPath.CIRCLE,
              fillColor: marker.active ? S.MAP_COLOR_OPEN_HOUSE : S.MAP_COLOR_NO_OPEN_HOUSE,
              fillOpacity: 1,
              strokeColor: "#ffffff",
              strokeWeight: 2,
              scale: 8,
            }}
            onClick={() => setSelectedId(marker.propertyExternalId)}
          />
        ))}

        {selected && (
          <InfoWindow
            position={{ lat: selected.latitude, lng: selected.longitude }}
            onCloseClick={() => setSelectedId(null)}
          >
            <div className="max-w-[240px] text-sm">
              <p className="font-semibold text-slate-900">{selected.address}</p>
              <ul className="mt-1 space-y-1">
                {selected.items.map((item) => (
                  <li key={item.myOpenHouseId} className="text-xs text-slate-600">
                    <span className="font-medium text-slate-900">
                      {formatOpenHouseDate(item.openHouse)}
                    </span>{" "}
                    · {formatOpenHouseTime(item.openHouse)} · {C.GROUP_LABELS[item.group]}
                  </li>
                ))}
              </ul>
              <Link
                to={D.PATH(selected.propertyExternalId)}
                className="mt-2 inline-block text-xs font-medium text-blue-600 hover:underline"
              >
                {C.VIEW_DETAILS}
              </Link>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>

      {withoutLocation > 0 && (
        <p className="absolute left-4 top-4 max-w-xs rounded-lg bg-white px-3 py-2 text-xs text-slate-600 shadow">
          {C.MAP_NO_LOCATION_NOTE(withoutLocation)}
        </p>
      )}

      <div className="absolute bottom-8 left-4 flex gap-4 rounded-xl bg-white px-4 py-2 text-xs shadow">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
          {C.MAP_LEGEND_ACTIVE} ({activeCount})
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
          {C.MAP_LEGEND_DONE} ({markers.length - activeCount})
        </div>
      </div>
    </section>
  )
}
