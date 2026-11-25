import { useState, type ReactNode } from "react"
import { Pencil, StickyNote, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  useCreateNoteMutation,
  useDeleteNoteMutation,
  useUpdateNoteMutation,
  type NoteSummaryDTO,
} from "@/store/propertiesApi"
import {
  canSaveNote,
  createParams,
  noteErrorKind,
  noteLength,
  normalizeNote,
  type NoteTarget,
} from "@/utils/notes"
import { notesConstants as C } from "@/common/constants"

interface NoteEditorProps {
  target: NoteTarget
  // The note of the item; missing or null when it has none
  note: NoteSummaryDTO | null | undefined
  // Names the item in the labels, for example its address
  subject: string
}

// What was just saved or deleted, kept until the list has been asked again. It only counts
// while the list still has the note it was based on.
interface LocalChange {
  basedOn: string | null
  value: NoteSummaryDTO | null
}

export default function NoteEditor({ target, note, subject }: NoteEditorProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState("")
  const [busy, setBusy] = useState<"save" | "delete" | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [change, setChange] = useState<LocalChange | null>(null)

  const [createNote] = useCreateNoteMutation()
  const [updateNote] = useUpdateNoteMutation()
  const [deleteNote] = useDeleteNoteMutation()

  const listKey = note?.updatedAt ?? null
  const shown = change && change.basedOn === listKey ? change.value : (note ?? null)
  const used = noteLength(draft)
  const canSave = busy === null && canSaveNote(draft, shown?.content ?? null)

  const startEditing = () => {
    setDraft(shown?.content ?? "")
    setError(null)
    setEditing(true)
  }

  const cancel = () => {
    setEditing(false)
    setError(null)
  }

  const save = async () => {
    const content = normalizeNote(draft)
    setError(null)
    setBusy("save")
    try {
      const saved = shown
        ? await updateNote({ noteId: shown.noteId, content }).unwrap()
        : await createNote(createParams(target, content)).unwrap()
      setChange({
        basedOn: listKey,
        value: { noteId: saved.noteId, content: saved.content, updatedAt: saved.updatedAt },
      })
      setEditing(false)
    } catch (err) {
      // The text stays in the box in every case, so nothing the user wrote is lost
      const kind = noteErrorKind(err)
      if (kind === "exists") {
        setError(C.ALREADY_EXISTS_ERROR)
      } else if (kind === "gone") {
        setError(C.GONE_ERROR)
      } else {
        setError(C.SAVE_ERROR)
      }
    } finally {
      setBusy(null)
    }
  }

  const remove = async () => {
    if (!shown) return

    setError(null)
    setBusy("delete")
    try {
      await deleteNote(shown.noteId).unwrap()
      setChange({ basedOn: listKey, value: null })
    } catch (err) {
      if (noteErrorKind(err) === "gone") {
        // It is gone already: nothing is left to delete
        setChange({ basedOn: listKey, value: null })
      } else {
        setError(C.DELETE_ERROR)
      }
    } finally {
      setBusy(null)
    }
  }

  let body: ReactNode
  if (editing) {
    body = (
      <div className="space-y-2">
        <textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          aria-label={C.INPUT_LABEL(subject)}
          placeholder={C.PLACEHOLDER}
          rows={3}
          autoFocus
          disabled={busy === "save"}
          className="w-full resize-y rounded-lg border border-slate-300 bg-white p-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className={`text-xs ${used > C.MAX_LENGTH ? "text-red-600" : "text-slate-400"}`}>
            {C.COUNT(used, C.MAX_LENGTH)}
          </span>
          <div className="flex gap-2">
            <Button type="button" variant="ghost" size="sm" disabled={busy !== null} onClick={cancel}>
              {C.CANCEL}
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={!canSave}
              onClick={() => {
                void save()
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {busy === "save" ? C.SAVING : C.SAVE}
            </Button>
          </div>
        </div>
      </div>
    )
  } else if (shown) {
    body = (
      <div className="flex items-start gap-3">
        <StickyNote className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" aria-hidden="true" />
        <p className="min-w-0 flex-1 whitespace-pre-wrap break-words text-slate-700">
          {shown.content}
        </p>
        <div className="flex shrink-0 gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={busy !== null}
            aria-label={C.EDIT_LABEL(subject)}
            onClick={startEditing}
            className="text-slate-500"
          >
            <Pencil className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">{C.EDIT}</span>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={busy !== null}
            aria-label={C.DELETE_LABEL(subject)}
            onClick={() => {
              void remove()
            }}
            className="text-slate-500 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">{busy === "delete" ? C.DELETING : C.DELETE}</span>
          </Button>
        </div>
      </div>
    )
  } else {
    body = (
      <Button
        type="button"
        variant="ghost"
        size="sm"
        aria-label={C.ADD_LABEL(subject)}
        onClick={startEditing}
        className="text-slate-500"
      >
        <StickyNote className="h-4 w-4" aria-hidden="true" />
        {C.ADD}
      </Button>
    )
  }

  return (
    <div role="group" aria-label={C.REGION_LABEL(subject)} className="text-sm">
      {body}
      {error && (
        <p role="alert" className="mt-2 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}
