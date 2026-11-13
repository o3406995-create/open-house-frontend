import { navbarConstants as C } from "@/common/constants"

export default function FindAgents() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="text-xl font-semibold text-slate-900">{C.NAV_FIND_AGENTS}</h1>
      <p className="mt-2 text-sm text-slate-500">{C.PAGE_COMING_SOON}</p>
    </div>
  )
}