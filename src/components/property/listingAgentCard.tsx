import { useState } from "react"
import { Mail, Phone } from "lucide-react"
import type { AgentDTO } from "@/store/propertiesApi"
import { toMailtoHref, toTelHref } from "@/utils/contactLinks"
import ComingSoonButton from "./comingSoonButton"
import { propertyDetailsConstants as D } from "@/common/constants"

interface ListingAgentCardProps {
  agent: AgentDTO
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, D.INITIALS_MAX)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("")
}

export default function ListingAgentCard({ agent }: ListingAgentCardProps) {
  const [photoFailed, setPhotoFailed] = useState(false)
  const phoneHref = toTelHref(agent.phone)
  const emailHref = toMailtoHref(agent.email)

  return (
    <section aria-label={D.LISTING_AGENT} className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="mb-3 text-sm font-semibold text-slate-900">{D.LISTING_AGENT}</p>

      <div className="flex items-center gap-4">
        {agent.photoUrl && !photoFailed ? (
          <img
            src={agent.photoUrl}
            alt={D.AGENT_PHOTO_ALT(agent.name)}
            className="h-16 w-16 shrink-0 rounded-full object-cover"
            onError={() => setPhotoFailed(true)}
          />
        ) : (
          <div
            aria-hidden="true"
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-blue-100 text-lg font-semibold text-blue-700"
          >
            {getInitials(agent.name)}
          </div>
        )}

        <div className="min-w-0 space-y-1 text-sm">
          <p className="font-semibold text-slate-900">{agent.name}</p>
          {agent.agencyName && <p className="text-slate-500">{agent.agencyName}</p>}
          {agent.phone && (
            <p className="flex items-center gap-1.5 text-slate-700">
              <Phone className="h-3.5 w-3.5 shrink-0 text-blue-600" aria-hidden="true" />
              {phoneHref ? (
                <a href={phoneHref} className="hover:underline">
                  {agent.phone}
                </a>
              ) : (
                agent.phone
              )}
            </p>
          )}
          {agent.email && (
            <p className="flex items-center gap-1.5 text-slate-700">
              <Mail className="h-3.5 w-3.5 shrink-0 text-blue-600" aria-hidden="true" />
              {emailHref ? (
                <a href={emailHref} className="truncate hover:underline">
                  {agent.email}
                </a>
              ) : (
                <span className="truncate">{agent.email}</span>
              )}
            </p>
          )}
        </div>
      </div>

      <div className="mt-4">
        <ComingSoonButton label={D.VIEW_AGENT_PROFILE} />
      </div>
    </section>
  )
}