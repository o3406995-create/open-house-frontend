import { describe, it, expect } from "@jest/globals"
import {
  canSaveNote,
  createParams,
  myOpenHouseTarget,
  noteErrorKind,
  noteLength,
  normalizeNote,
  savedPropertyTarget,
  shouldRefreshAfter,
} from "@/utils/notes"
import { notesConstants as C } from "@/common/constants"

describe("normalizeNote and noteLength", () => {
  it("trims both ends and counts what is left", () => {
    expect(normalizeNote("  hello \n")).toBe("hello")
    expect(noteLength("  hello \n")).toBe(5)
  })

  it("keeps the spaces and the line breaks inside", () => {
    expect(normalizeNote("a  b\nc")).toBe("a  b\nc")
  })
})

describe("canSaveNote", () => {
  it.each(["", "   ", "\n\t "])("needs text: %p is not enough", (draft) => {
    expect(canSaveNote(draft, null)).toBe(false)
  })

  it("accepts text for an item without a note", () => {
    expect(canSaveNote("Call the agent", null)).toBe(true)
  })

  it("accepts changed text", () => {
    expect(canSaveNote("Call the agent today", "Call the agent")).toBe(true)
  })

  it("does not accept the text that is stored already, whatever surrounds it", () => {
    expect(canSaveNote("Call the agent", "Call the agent")).toBe(false)
    expect(canSaveNote("  Call the agent \n", "Call the agent")).toBe(false)
  })

  it("accepts the longest note and not one character more", () => {
    expect(canSaveNote("a".repeat(C.MAX_LENGTH), null)).toBe(true)
    expect(canSaveNote("a".repeat(C.MAX_LENGTH + 1), null)).toBe(false)
  })

  it("counts the length after trimming", () => {
    expect(canSaveNote(` ${"a".repeat(C.MAX_LENGTH)} `, null)).toBe(true)
  })
})

describe("the target of a note", () => {
  it("describes a saved property and an entry in My Open Houses", () => {
    expect(savedPropertyTarget(3)).toEqual({ kind: "savedProperty", id: 3 })
    expect(myOpenHouseTarget(4)).toEqual({ kind: "userOpenHouse", id: 4 })
  })

  it("turns a target into the body the backend expects: exactly one id", () => {
    expect(createParams(savedPropertyTarget(3), "x")).toEqual({ savedPropertyId: 3, content: "x" })
    expect(createParams(myOpenHouseTarget(4), "x")).toEqual({ userOpenHouseId: 4, content: "x" })
  })
})

describe("noteErrorKind", () => {
  it.each([
    [404, "gone"],
    [409, "exists"],
    [400, "other"],
    [500, "other"],
  ])("status %p is %p", (status, kind) => {
    expect(noteErrorKind({ status })).toBe(kind)
  })

  it.each([undefined, null, "oops", { status: "FETCH_ERROR" }])("is other for %p", (error) => {
    expect(noteErrorKind(error)).toBe("other")
  })
})

describe("shouldRefreshAfter", () => {
  it.each([undefined, null])("refreshes after a success (%p)", (error) => {
    expect(shouldRefreshAfter(error)).toBe(true)
  })

  it.each([404, 409])("refreshes when the server answers %p", (status) => {
    expect(shouldRefreshAfter({ status })).toBe(true)
  })

  it.each([400, 401, 403, 500])("does not refresh after a %p", (status) => {
    expect(shouldRefreshAfter({ status })).toBe(false)
  })

  it("does not refresh after a network failure", () => {
    expect(shouldRefreshAfter({ status: "FETCH_ERROR" })).toBe(false)
  })
})
