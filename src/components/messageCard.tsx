import type { ReactNode } from "react"

interface MessageCardProps {
  title: string
  body?: string
  alert?: boolean
  children?: ReactNode
}

// A centred card for empty, error and log-in states
export default function MessageCard({ title, body, alert = false, children }: MessageCardProps) {
  return (
    <div
      role={alert ? "alert" : "status"}
      className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center"
    >
      <p className="text-lg font-semibold text-slate-900">{title}</p>
      {body && <p className="max-w-md text-sm text-slate-500">{body}</p>}
      {children}
    </div>
  )
}
