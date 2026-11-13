import { useState, type FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { isValidAddress } from "@/utils/addressValidation"
import { navbarConstants as N, searchPageConstants as S } from "@/common/constants"

export default function NavbarSearch() {
  const navigate = useNavigate()
  const [value, setValue] = useState("")
  const [hasError, setHasError] = useState(false)

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const trimmed = value.trim()

    if (!isValidAddress(trimmed)) {
      setHasError(true)
      return
    }

    setHasError(false)
    setValue("")
    const query = new URLSearchParams({ [S.URL_ADDRESS_PARAM]: trimmed }).toString()
    navigate(`${S.SEARCH_ROUTE}?${query}`)
  }

  return (
    <form role="search" onSubmit={handleSubmit} className="relative">
      <Search
        className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
        aria-hidden="true"
      />
      <Input
        type="search"
        value={value}
        onChange={(event) => {
          setValue(event.target.value)
          setHasError(false)
        }}
        placeholder={N.NAV_SEARCH_PLACEHOLDER}
        aria-label={N.NAV_SEARCH_LABEL}
        aria-invalid={hasError}
        className="w-44 pl-8"
      />
      {hasError && (
        <p
          role="alert"
          className="absolute left-0 top-full z-10 mt-1 whitespace-nowrap text-xs text-red-600"
        >
          {S.SEARCH_ERROR_INVALID}
        </p>
      )}
    </form>
  )
}