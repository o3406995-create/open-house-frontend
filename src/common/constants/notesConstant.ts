export const NOTES_CONSTANTS = {
  // The longest note the backend accepts, counted after the two ends are trimmed
  MAX_LENGTH: 2000,

  STATUS_NOT_FOUND: 404,
  STATUS_CONFLICT: 409,

  REGION_LABEL: (subject: string) => `Note on ${subject}`,
  INPUT_LABEL: (subject: string) => `Your note on ${subject}`,
  PLACEHOLDER: "Only you can see this note",
  COUNT: (used: number, max: number) => `${used} / ${max}`,

  ADD: "Add note",
  ADD_LABEL: (subject: string) => `Add a note to ${subject}`,
  EDIT: "Edit",
  EDIT_LABEL: (subject: string) => `Edit the note on ${subject}`,
  DELETE: "Delete",
  DELETE_LABEL: (subject: string) => `Delete the note on ${subject}`,
  DELETING: "Deleting...",
  SAVE: "Save",
  SAVING: "Saving...",
  CANCEL: "Cancel",

  SAVE_ERROR: "Could not save the note. Please try again.",
  DELETE_ERROR: "Could not delete the note. Please try again.",
  ALREADY_EXISTS_ERROR:
    "This item already has a note, written elsewhere. Save to replace its text with yours, or cancel to see it.",
  GONE_ERROR: "That note was deleted elsewhere. Save again to add it back.",
}
