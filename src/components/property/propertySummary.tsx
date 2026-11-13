import { Bath, BedDouble, Car, Home } from "lucide-react"
import type { PropertyDetailDTO } from "@/store/propertiesApi"
import { toMailtoHref, toTelHref } from "@/utils/contactLinks"
import { propertyDetailsConstants as D } from "@/common/constants"

interface PropertySummaryProps {
  property: PropertyDetailDTO
}

export default function PropertySummary({ property }: PropertySummaryProps) {
  const { agent } = property
  const contactHref = agent ? (toMailtoHref(agent.email) ?? toTelHref(agent.phone)) : null

  return (
    <div className="space-y-3">
      <div>
        <div role="heading" aria-level={1} className="text-2xl font-semibold text-slate-900">
          {property.address}
        </div>
        <p className="mt-1 text-sm text-slate-500">
          {property.suburb} {property.state} {property.postcode}
        </p>
      </div>

      <p className="text-xl font-semibold text-blue-600">{property.displayPrice}</p>

      <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-700">
        <li className="flex items-center gap-1.5" aria-label={D.BEDROOMS_LABEL(property.bedrooms)}>
          <BedDouble className="h-4 w-4 text-slate-500" aria-hidden="true" />
          {property.bedrooms}
        </li>
        <li className="flex items-center gap-1.5" aria-label={D.BATHROOMS_LABEL(property.bathrooms)}>
          <Bath className="h-4 w-4 text-slate-500" aria-hidden="true" />
          {property.bathrooms}
        </li>
        {property.carSpaces !== null && (
          <li className="flex items-center gap-1.5" aria-label={D.CAR_SPACES_LABEL(property.carSpaces)}>
            <Car className="h-4 w-4 text-slate-500" aria-hidden="true" />
            {property.carSpaces}
          </li>
        )}
        <li className="flex items-center gap-1.5">
          <Home className="h-4 w-4 text-slate-500" aria-hidden="true" />
          {property.propertyType}
        </li>
      </ul>

      {contactHref && (
        <a
          href={contactHref}
          className="inline-block text-base font-semibold text-slate-900 hover:text-blue-600 hover:underline"
        >
          {D.CONTACT_AGENT}
        </a>
      )}
    </div>
  )
}