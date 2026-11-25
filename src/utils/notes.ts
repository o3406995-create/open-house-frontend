import { notesConstants as C } from "@/common/constants"
import { errorStatus } from "@/utils/errorStatus"
import type { CreateNoteParams } from "@/store/propertiesApi"

// A note belongs to one saved property or to one entry in My Open Houses
export type NoteTarget =
  | { kind: "savedProperty"; id: number }
  | { kind: "userOpenHouse"; id: number }

export const savedPropertyTarget = (savedPropertyId: number): NoteTarget => ({
  kind: "savedProperty",
  id: savedPropertyId,
})

export const myOpenHouseTarget = (myOpenHouseId: number): NoteTarget => ({
  kind: "userOpenHouse",
  id: myOpenHouseId,
})

// The body of a new note: exactly one of the two ids
export function createParams(target: NoteTarget, content: string): CreateNoteParams {
  return target.kind === "savedProperty"
    ? { savedPropertyId: target.id, content }
    : { userOpenHouseId: target.id, content }
}

// The backend trims the text before it counts it and stores it
export function normalizeNote(text: string): string {
  return text.trim()
}

export function noteLength(text: string): number {
  return normalizeNote(text).length
}

// Saving needs text within the limit that is not what is stored already
export function canSaveNote(draft: string, stored: string | null): boolean {
  const text = normalizeNote(draft)

  if (text.length === 0 || text.length > C.MAX_LENGTH) return false

  return text !== stored?.trim()
}

export type NoteErrorKind = "gone" | "exists" | "other"

// 404: the note (or the item) is gone. 409: the item has a note already.
export function noteErrorKind(error: unknown): NoteErrorKind {
  const status = errorStatus(error)

  if (status === C.STATUS_NOT_FOUND) return "gone"
  if (status === C.STATUS_CONFLICT) return "exists"
  return "other"
}

// The lists are asked again after a note was saved or deleted, and also when the server said
// the note is gone or that the item has one already: either way the lists are out of date.
// Any other failure changes nothing.
export function shouldRefreshAfter(error: unknown): boolean {
  if (error === undefined || error === null) return true

  return noteErrorKind(error) !== "other"
}
