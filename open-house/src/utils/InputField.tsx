type InputFieldProps = {
  type: string
  placeholder: string
  value: string
  onChange: (value: string) => void
}

export const InputField = ({
  type,
  placeholder,
  value,
  onChange,
}: InputFieldProps) => {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500"
    />
  )
}