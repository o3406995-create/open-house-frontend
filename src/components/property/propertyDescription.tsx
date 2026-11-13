import { propertyDetailsConstants as D } from "@/common/constants"

interface PropertyDescriptionProps {
  description: string | null
  propertyType: string
  landSizeSqm: number | null
}

export default function PropertyDescription({
  description,
  propertyType,
  landSizeSqm,
}: PropertyDescriptionProps) {
  return (
    <section className="mt-10 border-t border-slate-200 pt-6">
      <div role="heading" aria-level={2} className="text-lg font-semibold text-slate-900">
        {D.PROPERTY_DETAILS}
      </div>

      <div className="mt-3 grid gap-6 md:grid-cols-[2fr_1fr]">
        {description ? (
          <p className="whitespace-pre-line text-sm leading-relaxed text-slate-600">{description}</p>
        ) : (
          <div />
        )}

        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="font-semibold text-slate-900">{D.PROPERTY_TYPE}</dt>
            <dd className="mt-1 text-slate-600">{propertyType}</dd>
          </div>
          {landSizeSqm !== null && (
            <div>
              <dt className="font-semibold text-slate-900">{D.LAND_SIZE}</dt>
              <dd className="mt-1 text-slate-600">
                {landSizeSqm.toLocaleString(D.LOCALE)} {D.LAND_SIZE_UNIT}
              </dd>
            </div>
          )}
        </dl>
      </div>
    </section>
  )
}