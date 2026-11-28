import { describe, it, expect, jest } from "@jest/globals"
import { render } from "@testing-library/react"
import TimeZoneReporter from "@/components/timeZoneReporter"

interface StoredUser {
  user_id: number
  time_zone?: string | null
}

// The logged-in user, the zone of the browser and the request are replaced with fakes: what is
// checked is when the component asks and what it does with the answer.
const mockUser = jest.fn<() => StoredUser | null>()
const mockZone = jest.fn<() => string | null>()
const mockDispatch = jest.fn<(action: unknown) => void>()
const mockReport = jest.fn<(zone: string) => { unwrap: () => Promise<{ timeZone: string }> }>()

jest.mock("@/store/hooks", () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (select: (state: unknown) => unknown) => select({ auth: { user: mockUser() } }),
}))

jest.mock("@/store/authApi", () => ({
  // A new function at every render, unlike the one of RTK Query: what keeps the request from being
  // repeated has to be the component itself
  useSetTimeZoneMutation: () => [(zone: string) => mockReport(zone)],
}))

jest.mock("@/store/authSlice", () => ({
  setUserTimeZone: (zone: string) => ({ type: "auth/setUserTimeZone", payload: zone }),
}))

jest.mock("@/utils/timeZone", () => ({
  ...jest.requireActual<typeof import("@/utils/timeZone")>("@/utils/timeZone"),
  browserTimeZone: () => mockZone(),
}))

const answers = (timeZone: string) => () => ({ unwrap: () => Promise.resolve({ timeZone }) })
const fails = () => ({ unwrap: () => Promise.reject(new Error("failed")) })
const flush = () => new Promise((resolve) => setTimeout(resolve, 0))

function setup(
  user: StoredUser | null,
  zone: string | null,
  report: () => { unwrap: () => Promise<{ timeZone: string }> } = answers("Australia/Sydney"),
) {
  mockUser.mockReturnValue(user)
  mockZone.mockReturnValue(zone)
  mockReport.mockImplementation(report)
  return render(<TimeZoneReporter />)
}

describe("TimeZoneReporter", () => {
  it("renders nothing", () => {
    const { container } = setup({ user_id: 1, time_zone: null }, "Australia/Sydney")

    expect(container).toBeEmptyDOMElement()
  })

  it("reports nothing when nobody is logged in", () => {
    setup(null, "Australia/Sydney")

    expect(mockReport).not.toHaveBeenCalled()
  })

  it("reports nothing when the server has the time zone of the browser already", () => {
    setup({ user_id: 1, time_zone: "Australia/Sydney" }, "Australia/Sydney")

    expect(mockReport).not.toHaveBeenCalled()
  })

  it("reports the time zone of the browser when it is another one", () => {
    setup({ user_id: 1, time_zone: "Australia/Brisbane" }, "Australia/Sydney")

    expect(mockReport).toHaveBeenCalledTimes(1)
    expect(mockReport).toHaveBeenCalledWith("Australia/Sydney")
  })

  it("reports it when the server has none stored", () => {
    setup({ user_id: 1, time_zone: null }, "Australia/Sydney")

    expect(mockReport).toHaveBeenCalledWith("Australia/Sydney")
  })

  it("reports it when the user has no such field (the answer of the login may leave it out)", () => {
    setup({ user_id: 1 }, "Australia/Sydney")

    expect(mockReport).toHaveBeenCalledWith("Australia/Sydney")
  })

  it("reports nothing when the browser does not say its time zone", () => {
    setup({ user_id: 1, time_zone: null }, null)

    expect(mockReport).not.toHaveBeenCalled()
  })

  it("does not ask again when it renders again for the same user and zone", () => {
    const { rerender } = setup({ user_id: 1, time_zone: null }, "Australia/Sydney")

    rerender(<TimeZoneReporter />)
    rerender(<TimeZoneReporter />)

    expect(mockReport).toHaveBeenCalledTimes(1)
  })

  it("stores the name the server answers on the user", async () => {
    setup({ user_id: 1, time_zone: null }, "Australia/Sydney", answers("Australia/Sydney"))

    await flush()

    expect(mockDispatch).toHaveBeenCalledWith({
      type: "auth/setUserTimeZone",
      payload: "Australia/Sydney",
    })
  })

  it("swallows a failure, stores nothing and does not try again", async () => {
    const { rerender } = setup({ user_id: 1, time_zone: null }, "Australia/Sydney", fails)

    await flush()
    rerender(<TimeZoneReporter />)
    await flush()

    expect(mockReport).toHaveBeenCalledTimes(1)
    expect(mockDispatch).not.toHaveBeenCalled()
  })

  it("asks again for another user", () => {
    const { rerender } = setup({ user_id: 1, time_zone: null }, "Australia/Sydney")

    mockUser.mockReturnValue({ user_id: 2, time_zone: null })
    rerender(<TimeZoneReporter />)

    expect(mockReport).toHaveBeenCalledTimes(2)
  })

  it("asks again when the browser moves to another time zone", () => {
    const { rerender } = setup({ user_id: 1, time_zone: "Australia/Brisbane" }, "Australia/Sydney")

    mockZone.mockReturnValue("Europe/London")
    rerender(<TimeZoneReporter />)

    expect(mockReport).toHaveBeenNthCalledWith(1, "Australia/Sydney")
    expect(mockReport).toHaveBeenNthCalledWith(2, "Europe/London")
  })

  it("does not store a late answer on somebody who logged in in the meantime", async () => {
    let answerFirst: (value: { timeZone: string }) => void = () => undefined
    mockUser.mockReturnValue({ user_id: 1, time_zone: null })
    mockZone.mockReturnValue("Australia/Sydney")
    mockReport
      .mockImplementationOnce(() => ({
        unwrap: () =>
          new Promise<{ timeZone: string }>((resolve) => {
            answerFirst = resolve
          }),
      }))
      .mockImplementation(() => ({ unwrap: () => new Promise<{ timeZone: string }>(() => undefined) }))
    const { rerender } = render(<TimeZoneReporter />)

    mockUser.mockReturnValue({ user_id: 2, time_zone: null })
    rerender(<TimeZoneReporter />)
    answerFirst({ timeZone: "Australia/Sydney" })
    await flush()

    expect(mockDispatch).not.toHaveBeenCalled()
  })
})
