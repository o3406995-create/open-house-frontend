import type { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { propertyDetailsConstants as D } from "@/common/constants"

interface ComingSoonButtonProps {
  label: string
  icon?: ReactNode
  primary?: boolean
}

// Placeholder for actions whose backend is not built yet (#37, #41, #63).
export default function ComingSoonButton({ label, icon, primary = false }: ComingSoonButtonProps) {
  return (
    <Button
      type="button"
      variant={primary ? "default" : "outline"}
      disabled
      className={`h-auto min-h-9 w-full flex-wrap justify-center gap-x-2 gap-y-1 whitespace-normal px-3 py-2 text-center ${
        primary ? "bg-blue-600" : "border-blue-200 text-blue-600"
      }`}
    >
      {icon}
      <span>{label}</span>
      <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
        {D.COMING_SOON}
      </span>
    </Button>
  )
}