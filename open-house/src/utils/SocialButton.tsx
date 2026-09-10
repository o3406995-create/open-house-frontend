import type { ReactNode } from "react"
import { Button } from "@/components/ui/button"

interface SocialButtonProps {
  icon: ReactNode
  text: string
  onClick: () => void
}

// Full-width outline button used for third-party sign-in options
// (Google, Apple, etc). Pass the brand icon as a node and the label as text.
export function SocialButton({ icon, text, onClick }: SocialButtonProps) {
  return (
    <Button variant="outline" className="w-full gap-2" onClick={onClick}>
      {icon}
      {text}
    </Button>
  )
}