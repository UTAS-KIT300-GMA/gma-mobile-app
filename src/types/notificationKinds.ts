/**
 * Aligns with the website `NotificationKind` + mobile-relevant kinds.
 * FCM `data` payloads use string values (see Firebase messaging docs).
 *
 * Booked-user pushes (match portal `queueNotification` + Cloud Function):
 * - `event_cancelled` — include `eventId` (string).
 * - `event_date_changed` — include `eventId`; optional human text in `title` / `body` (e.g. new date).
 */
export type NotificationKind =
  | "partner_approval_result"
  | "event_submitted_for_review"
  | "event_approval_result"
  | "event_cancelled"
  | "event_date_changed";

const ALLOWED: readonly NotificationKind[] = [
  "partner_approval_result",
  "event_submitted_for_review",
  "event_approval_result",
  "event_cancelled",
  "event_date_changed",
] as const;

export function parseNotificationKind(value: unknown): NotificationKind | null {
  if (typeof value !== "string") return null;
  return (ALLOWED as readonly string[]).includes(value)
    ? (value as NotificationKind)
    : null;
}
