import type { ReactNode } from "react"

type SocialButtonProps = {
  text: string
  icon: ReactNode
  onClick: () => void
}

export const SocialButton = ({
  text,
  icon,
  onClick,
}: SocialButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center justify-center gap-3 rounded-lg border border-slate-300 bg-white py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
    >
      {icon}

      {text}
    </button>
  )
}