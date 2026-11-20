import { describe, it, expect } from "@jest/globals"
import { render, screen } from "@testing-library/react"
import { propertyDetailsConstants as D } from "@/common/constants"
import ComingSoonButton from "@/components/property/comingSoonButton"

describe("ComingSoonButton", () => {
  it("shows the label and the coming soon tag", () => {
    render(<ComingSoonButton label="Save Property" />)

    const button = screen.getByRole("button")

    expect(button).toHaveTextContent("Save Property")
    expect(button).toHaveTextContent(D.COMING_SOON)
  })

  it("is disabled and does not submit a form", () => {
    render(<ComingSoonButton label="Save Property" />)

    const button = screen.getByRole("button")

    expect(button).toBeDisabled()
    expect(button).toHaveAttribute("type", "button")
  })

  it("renders the icon when one is given", () => {
    render(<ComingSoonButton label="Save Property" icon={<svg data-testid="icon" />} />)

    expect(screen.getByTestId("icon")).toBeInTheDocument()
  })

  it("renders no icon when none is given", () => {
    render(<ComingSoonButton label="Save Property" />)

    expect(screen.getByRole("button").querySelector("svg")).toBeNull()
  })

  it("is disabled in the primary style too", () => {
    render(<ComingSoonButton label="Add this Open House" primary />)

    const button = screen.getByRole("button")

    expect(button).toBeDisabled()
    expect(button).toHaveTextContent("Add this Open House")
    expect(button).toHaveTextContent(D.COMING_SOON)
  })
})
