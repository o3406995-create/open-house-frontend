import { describe, it, expect } from "@jest/globals"
import { render, screen } from "@testing-library/react"

describe("test environment", () => {
  it("renders a component into jsdom", () => {
    render(<button>Hello</button>)

    expect(screen.getByRole("button", { name: "Hello" })).toBeInTheDocument()
  })
})
