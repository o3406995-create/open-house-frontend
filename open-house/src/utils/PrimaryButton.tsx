type PrimaryButtonProps = {
  text: string
  onClick: () => void
}

export const PrimaryButton = ({
  text,
  onClick,
}: PrimaryButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="w-full rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700"
    >
      {text}
    </button>
  )
}