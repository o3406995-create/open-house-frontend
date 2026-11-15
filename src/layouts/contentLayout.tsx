import type { ReactNode } from "react"

interface ContentLayoutProps {
  children: ReactNode
  // Pages designed edge to edge (the search page hero and map) skip the grid and its padding
  fullBleed?: boolean
}

// 4 columns on a phone, 12 from the sm breakpoint. Side padding applies at every width.
const GRID_CLASS =
  "grid h-full flex-1 grid-cols-4 gap-x-4 px-4 max-sm:pb-10 sm:grid-cols-12 sm:py-2"

const CONTENT_CLASS = "col-span-4 min-w-0 sm:col-span-12"

const FULL_BLEED_CLASS = "flex min-w-0 flex-1 flex-col"

export default function ContentLayout({ children, fullBleed = false }: ContentLayoutProps) {
  if (fullBleed) {
    return <div className={FULL_BLEED_CLASS}>{children}</div>
  }

  return (
    <div className={GRID_CLASS}>
      <div className={CONTENT_CLASS}>{children}</div>
    </div>
  )
}