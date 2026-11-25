import { describe, it, expect, jest } from "@jest/globals"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import NoteEditor from "@/components/notes/noteEditor"
import type { NoteSummaryDTO } from "@/store/propertiesApi"
import { savedPropertyTarget } from "@/utils/notes"
import { notesConstants as C } from "@/common/constants"

const mockCreate = jest.fn<(body: unknown) => unknown>()
const mockUpdate = jest.fn<(body: unknown) => unknown>()
const mockDelete = jest.fn<(id: number) => unknown>()

jest.mock("@/store/propertiesApi", () => ({
  useCreateNoteMutation: () => [(body: unknown) => mockCreate(body)],
  useUpdateNoteMutation: () => [(body: unknown) => mockUpdate(body)],
  useDeleteNoteMutation: () => [(id: number) => mockDelete(id)],
}))

const SUBJECT = "12 Example Street, Brisbane"
const NOTE: NoteSummaryDTO = {
  noteId: 5,
  content: "Call the agent",
  updatedAt: "2026-11-24T01:00:00.000Z",
}

const succeeds = (value: unknown) => ({ unwrap: () => Promise.resolve(value) })
const fails = (status: number) => ({ unwrap: () => Promise.reject({ status }) })
const neverEnds = () => ({ unwrap: () => new Promise(() => {}) })

const editor = (note: NoteSummaryDTO | null | undefined) => (
  <NoteEditor target={savedPropertyTarget(3)} note={note} subject={SUBJECT} />
)
const textBox = () => screen.getByRole("textbox", { name: C.INPUT_LABEL(SUBJECT) })
const saveButton = () => screen.getByRole("button", { name: C.SAVE })

async function startNewNote(user: ReturnType<typeof userEvent.setup>, text: string) {
  await user.click(screen.getByRole("button", { name: C.ADD_LABEL(SUBJECT) }))
  await user.type(textBox(), text)
}

describe("NoteEditor: when something goes wrong", () => {
  it("says so and keeps the text when saving fails", async () => {
    const user = userEvent.setup()
    mockCreate.mockReturnValue(fails(500))
    render(editor(null))

    await startNewNote(user, "My text")
    await user.click(saveButton())

    expect(await screen.findByRole("alert")).toHaveTextContent(C.SAVE_ERROR)
    expect(textBox()).toHaveValue("My text")
    expect(saveButton()).toBeEnabled()
  })

  it("says the item has a note already on a 409 and keeps the text", async () => {
    const user = userEvent.setup()
    mockCreate.mockReturnValue(fails(409))
    render(editor(null))

    await startNewNote(user, "My text")
    await user.click(saveButton())

    expect(await screen.findByRole("alert")).toHaveTextContent(C.ALREADY_EXISTS_ERROR)
    expect(textBox()).toHaveValue("My text")
  })

  it("replaces the other note when the list shows it and the user saves again", async () => {
    const user = userEvent.setup()
    mockCreate.mockReturnValue(fails(409))
    mockUpdate.mockReturnValue(succeeds({ ...NOTE, savedPropertyId: 3, userOpenHouseId: null, createdAt: "x" }))
    const { rerender } = render(editor(null))

    await startNewNote(user, "My text")
    await user.click(saveButton())
    await screen.findByRole("alert")

    rerender(editor({ noteId: 9, content: "Written elsewhere", updatedAt: "2026-11-24T04:00:00.000Z" }))
    await user.click(saveButton())

    await waitFor(() => expect(mockUpdate).toHaveBeenCalledWith({ noteId: 9, content: "My text" }))
  })

  it("says the note is gone on a 404 when changing it and keeps the text", async () => {
    const user = userEvent.setup()
    mockUpdate.mockReturnValue(fails(404))
    render(editor(NOTE))

    await user.click(screen.getByRole("button", { name: C.EDIT_LABEL(SUBJECT) }))
    await user.type(textBox(), " today")
    await user.click(saveButton())

    expect(await screen.findByRole("alert")).toHaveTextContent(C.GONE_ERROR)
    expect(textBox()).toHaveValue("Call the agent today")
  })

  it("treats a 404 when deleting as done: no message, nothing left to delete", async () => {
    const user = userEvent.setup()
    mockDelete.mockReturnValue(fails(404))
    render(editor(NOTE))

    await user.click(screen.getByRole("button", { name: C.DELETE_LABEL(SUBJECT) }))

    expect(await screen.findByRole("button", { name: C.ADD_LABEL(SUBJECT) })).toBeInTheDocument()
    expect(screen.queryByRole("alert")).not.toBeInTheDocument()
  })

  it("says so and keeps the note when deleting fails", async () => {
    const user = userEvent.setup()
    mockDelete.mockReturnValue(fails(500))
    render(editor(NOTE))

    await user.click(screen.getByRole("button", { name: C.DELETE_LABEL(SUBJECT) }))

    expect(await screen.findByRole("alert")).toHaveTextContent(C.DELETE_ERROR)
    expect(screen.getByText("Call the agent")).toBeInTheDocument()
  })

  it("does not send a second request while the first one is on its way", async () => {
    const user = userEvent.setup()
    mockCreate.mockReturnValue(neverEnds())
    render(editor(null))

    await startNewNote(user, "My text")
    await user.click(saveButton())

    const saving = screen.getByRole("button", { name: C.SAVING })
    expect(saving).toBeDisabled()
    expect(textBox()).toBeDisabled()
    expect(screen.getByRole("button", { name: C.CANCEL })).toBeDisabled()

    await user.click(saving)
    expect(mockCreate).toHaveBeenCalledTimes(1)
  })
})
