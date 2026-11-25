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

const saved = (content: string) => ({
  noteId: 5,
  savedPropertyId: 3,
  userOpenHouseId: null,
  content,
  createdAt: NOTE.updatedAt,
  updatedAt: "2026-11-24T02:00:00.000Z",
})
const succeeds = (value: unknown) => ({ unwrap: () => Promise.resolve(value) })

const editor = (note: NoteSummaryDTO | null | undefined) => (
  <NoteEditor target={savedPropertyTarget(3)} note={note} subject={SUBJECT} />
)
const addButton = () => screen.getByRole("button", { name: C.ADD_LABEL(SUBJECT) })
const editButton = () => screen.getByRole("button", { name: C.EDIT_LABEL(SUBJECT) })
const deleteButton = () => screen.getByRole("button", { name: C.DELETE_LABEL(SUBJECT) })
const saveButton = () => screen.getByRole("button", { name: C.SAVE })
const textBox = () => screen.getByRole("textbox", { name: C.INPUT_LABEL(SUBJECT) })

describe("NoteEditor: an item without a note", () => {
  it.each([null, undefined])("offers to add one when the note is %p", (note) => {
    render(editor(note))

    expect(addButton()).toBeInTheDocument()
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument()
  })

  it("opens an empty text box where Save waits for real text", async () => {
    const user = userEvent.setup()
    render(editor(null))

    await user.click(addButton())
    expect(textBox()).toHaveValue("")
    expect(saveButton()).toBeDisabled()

    await user.type(textBox(), "   ")
    expect(saveButton()).toBeDisabled()

    await user.type(textBox(), "Call the agent")
    expect(saveButton()).toBeEnabled()
  })

  it("creates the note on the item with the trimmed text and closes the box", async () => {
    const user = userEvent.setup()
    mockCreate.mockReturnValue(succeeds(saved("Call the agent")))
    render(editor(null))

    await user.click(addButton())
    await user.type(textBox(), "  Call the agent  ")
    await user.click(saveButton())

    await waitFor(() => expect(screen.queryByRole("textbox")).not.toBeInTheDocument())
    expect(mockCreate).toHaveBeenCalledWith({ savedPropertyId: 3, content: "Call the agent" })
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it("shows what was saved at once, before the list has been asked again", async () => {
    const user = userEvent.setup()
    mockCreate.mockReturnValue(succeeds(saved("Call the agent")))
    render(editor(null))

    await user.click(addButton())
    await user.type(textBox(), "Call the agent")
    await user.click(saveButton())

    expect(await screen.findByText("Call the agent")).toBeInTheDocument()
  })

  it("goes back to the list once it brings a newer note", async () => {
    const user = userEvent.setup()
    mockCreate.mockReturnValue(succeeds(saved("Call the agent")))
    const { rerender } = render(editor(null))

    await user.click(addButton())
    await user.type(textBox(), "Call the agent")
    await user.click(saveButton())
    await screen.findByText("Call the agent")

    rerender(
      editor({ noteId: 5, content: "Changed on another device", updatedAt: "2026-11-24T03:00:00.000Z" }),
    )

    expect(screen.getByText("Changed on another device")).toBeInTheDocument()
    expect(screen.queryByText("Call the agent")).not.toBeInTheDocument()
  })

  it("changes the note it has just created by its id, before the list is asked again", async () => {
    const user = userEvent.setup()
    mockCreate.mockReturnValue(succeeds(saved("Call the agent")))
    mockUpdate.mockReturnValue(succeeds(saved("Call the agent today")))
    render(editor(null))

    await user.click(addButton())
    await user.type(textBox(), "Call the agent")
    await user.click(saveButton())
    await user.click(await screen.findByRole("button", { name: C.EDIT_LABEL(SUBJECT) }))
    await user.type(textBox(), " today")
    await user.click(saveButton())

    await waitFor(() =>
      expect(mockUpdate).toHaveBeenCalledWith({ noteId: 5, content: "Call the agent today" }),
    )
  })
})

describe("NoteEditor: an item with a note", () => {
  it("shows the text with Edit and Delete", () => {
    render(editor(NOTE))

    expect(screen.getByText("Call the agent")).toBeInTheDocument()
    expect(editButton()).toBeInTheDocument()
    expect(deleteButton()).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: C.ADD_LABEL(SUBJECT) })).not.toBeInTheDocument()
  })

  it("opens the box with the stored text, where Save waits for a change", async () => {
    const user = userEvent.setup()
    render(editor(NOTE))

    await user.click(editButton())
    expect(textBox()).toHaveValue("Call the agent")
    expect(saveButton()).toBeDisabled()

    await user.type(textBox(), " today")
    expect(saveButton()).toBeEnabled()
  })

  it("changes the note by its id with the trimmed text", async () => {
    const user = userEvent.setup()
    mockUpdate.mockReturnValue(succeeds(saved("Call the agent today")))
    render(editor(NOTE))

    await user.click(editButton())
    await user.type(textBox(), " today  ")
    await user.click(saveButton())

    await waitFor(() =>
      expect(mockUpdate).toHaveBeenCalledWith({ noteId: 5, content: "Call the agent today" }),
    )
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it("leaves the note as it was when the change is cancelled", async () => {
    const user = userEvent.setup()
    render(editor(NOTE))

    await user.click(editButton())
    await user.type(textBox(), " and more")
    await user.click(screen.getByRole("button", { name: C.CANCEL }))

    expect(screen.queryByRole("textbox")).not.toBeInTheDocument()
    expect(screen.getByText("Call the agent")).toBeInTheDocument()
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it("deletes the note by its id and offers to add one again", async () => {
    const user = userEvent.setup()
    mockDelete.mockReturnValue(succeeds(undefined))
    render(editor(NOTE))

    await user.click(deleteButton())

    await waitFor(() => expect(mockDelete).toHaveBeenCalledWith(5))
    expect(await screen.findByRole("button", { name: C.ADD_LABEL(SUBJECT) })).toBeInTheDocument()
  })
})

describe("NoteEditor: focus", () => {
  it("puts the cursor in the text box when it opens", async () => {
    const user = userEvent.setup()
    render(editor(null))

    await user.click(addButton())

    expect(textBox()).toHaveFocus()
  })
})
