import { describe, it, expect } from "@jest/globals"
import {
  badgeText,
  bellLabel,
  canSeeNotifications,
  labelOf,
  notificationsParams,
  shouldRefreshAfterRead,
  totalPagesOf,
} from "@/utils/notifications"

describe("canSeeNotifications", () => {
  it("lets a USER account see them", () => {
    expect(canSeeNotifications("USER")).toBe(true)
  })

  it.each(["AGENT", "ADMIN", "user", "", " USER"])("keeps %p out", (role) => {
    expect(canSeeNotifications(role)).toBe(false)
  })

  it.each([null, undefined])("keeps %p out: nobody is logged in", (role) => {
    expect(canSeeNotifications(role)).toBe(false)
  })
})

describe("labelOf", () => {
  it.each([
    ["NEW_OPEN_HOUSE", "New open house"],
    ["OPEN_HOUSE_REMINDER", "Open house tomorrow"],
    ["OPEN_HOUSE_TODAY", "Open house today"],
    ["PRICE_CHANGE", "Price change"],
    ["STATUS_CHANGE", "Status change"],
  ])("names %s", (type, label) => {
    expect(labelOf(type)).toBe(label)
  })

  it("uses the general label for a type it does not know", () => {
    expect(labelOf("SOMETHING_NEW")).toBe("Notification")
  })

  it.each(["constructor", "__proto__", "toString", ""])(
    "uses the general label for %p, which is not a type",
    (type) => {
      expect(labelOf(type)).toBe("Notification")
    },
  )
})

describe("badgeText", () => {
  it.each([0, -3, NaN, Infinity])("shows nothing for %p", (unread) => {
    expect(badgeText(unread)).toBeNull()
  })

  const shown: [number, string][] = [
    [1, "1"],
    [9, "9"],
    [99, "99"],
    [100, "99+"],
    [250, "99+"],
    [2.7, "2"],
  ]
  it.each(shown)("shows %p as %p", (unread, text) => {
    expect(badgeText(unread)).toBe(text)
  })
})

describe("bellLabel", () => {
  it("is plain when nothing is unread", () => {
    expect(bellLabel(0)).toBe("Notifications")
  })

  it("says how many are unread", () => {
    expect(bellLabel(3)).toBe("Notifications, 3 unread")
  })

  it("says 99+ for a lot", () => {
    expect(bellLabel(150)).toBe("Notifications, 99+ unread")
  })
})

describe("totalPagesOf", () => {
  const pages: [number, number, number][] = [
    [0, 20, 1],
    [1, 20, 1],
    [20, 20, 1],
    [21, 20, 2],
    [40, 20, 2],
  ]
  it.each(pages)("%p notifications with %p to a page is %p page(s)", (total, size, expected) => {
    expect(totalPagesOf(total, size)).toBe(expected)
  })
})

describe("shouldRefreshAfterRead", () => {
  const cases: [unknown, boolean][] = [
    [undefined, true],
    [null, true],
    [{ status: 404 }, true],
    [{ status: 500 }, false],
    [{ status: 401 }, false],
    [{ status: "FETCH_ERROR" }, false],
    ["boom", false],
  ]
  it.each(cases)("for the error %p it is %p", (error, expected) => {
    expect(shouldRefreshAfterRead(error)).toBe(expected)
  })
})

describe("notificationsParams", () => {
  it("asks for the page in pages of the size the list uses", () => {
    expect(notificationsParams(1)).toEqual({ page: 1, pageSize: 20 })
    expect(notificationsParams(3)).toEqual({ page: 3, pageSize: 20 })
  })
})
