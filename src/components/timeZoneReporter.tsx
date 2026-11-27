import { useEffect, useRef } from "react"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { useSetTimeZoneMutation } from "@/store/authApi"
import { setUserTimeZone } from "@/store/authSlice"
import { browserTimeZone, shouldReportTimeZone } from "@/utils/timeZone"

// Tells the server which time zone the browser is on when it is not the one the server has stored.
// What happens without a request (the reminders the evening before and on the morning of an open
// house) is worked out on that zone. It renders nothing. A failure is not shown and not tried
// again until the page is loaded again: the reminders then use the zone the server already has.
export default function TimeZoneReporter() {
  const dispatch = useAppDispatch()
  const user = useAppSelector((state) => state.auth.user)
  const [reportTimeZone] = useSetTimeZoneMutation()

  // The user and the zone that were asked for in this page load. The user is replaced in the store
  // more than once (after logging in, after the check of the session), and none of that may ask again.
  const asked = useRef<string | null>(null)

  const userId = user?.user_id
  const stored = user?.time_zone
  const zone = browserTimeZone()

  useEffect(() => {
    if (userId === undefined) {
      asked.current = null
      return
    }
    if (zone === null || !shouldReportTimeZone(stored, zone)) return

    const key = `${userId}:${zone}`
    if (asked.current === key) return
    asked.current = key

    void reportTimeZone(zone)
      .unwrap()
      .then((answer) => {
        // An answer that comes late must not land on somebody who logged in in the meantime
        if (asked.current === key) dispatch(setUserTimeZone(answer.timeZone))
      })
      .catch(() => undefined)
  }, [userId, stored, zone, reportTimeZone, dispatch])

  return null
}
