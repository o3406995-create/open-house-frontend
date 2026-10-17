import { useState } from "react"
import { GoogleMap, Marker, Circle, InfoWindow } from "@react-google-maps/api"
import type { PropertyDTO } from "@/store/propertiesApi"
import { homePageConstants as C } from "@/common/constants"

interface MapViewProps {
  properties: PropertyDTO[]
  center: { lat: number; lng: number }
  radiusMeters: number
}

const mapOptions: google.maps.MapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: false,
}

export default function MapView({ properties, center, radiusMeters }: MapViewProps) {
  const [selected, setSelected] = useState<PropertyDTO | null>(null)

  const propertiesWithCoords = properties.filter(
    (p): p is PropertyDTO & { latitude: number; longitude: number } =>
      p.latitude !== null && p.longitude !== null,
  )

  return (
    <div className="h-full w-full">
      <GoogleMap
        mapContainerClassName="h-full w-full"
        center={center}
        zoom={C.DEFAULT_MAP_ZOOM}
        options={mapOptions}
      >
        <Circle
          center={center}
          radius={radiusMeters}
          options={{
            fillColor: C.MAP_COLOR_RADIUS_CIRCLE,
            fillOpacity: 0.08,
            strokeColor: C.MAP_COLOR_RADIUS_CIRCLE,
            strokeOpacity: 0.4,
            strokeWeight: 1,
          }}
        />

        {propertiesWithCoords.map((property) => {
          const hasOpenHouse = property.openHouses.length > 0

          return (
            <Marker
              key={property.externalId}
              position={{ lat: property.latitude, lng: property.longitude }}
              icon={{
                path: window.google.maps.SymbolPath.CIRCLE,
                fillColor: hasOpenHouse ? C.MAP_COLOR_OPEN_HOUSE : C.MAP_COLOR_NO_OPEN_HOUSE,
                fillOpacity: 1,
                strokeColor: "#ffffff",
                strokeWeight: 2,
                scale: 8,
              }}
              onClick={() => setSelected(property)}
            />
          )
        })}

        {selected && selected.latitude !== null && selected.longitude !== null && (
          <InfoWindow
            position={{ lat: selected.latitude, lng: selected.longitude }}
            onCloseClick={() => setSelected(null)}
          >
            <div className="max-w-[200px] text-sm">
              <p className="font-semibold text-slate-900">{selected.address}</p>
              <p className="text-slate-600">{selected.displayPrice}</p>
              <p className="text-xs text-slate-500">
                {selected.bedrooms} bed · {selected.bathrooms} bath · {selected.propertyType}
              </p>
              {selected.openHouses.length > 0 && (
                <p className="mt-1 text-xs font-medium text-red-600">
                  Open house: {new Date(selected.openHouses[0].startDatetime).toLocaleString()}
                </p>
              )}
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  )
}