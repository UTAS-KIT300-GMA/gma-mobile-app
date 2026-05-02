/**
 * Aligns with the website `NotificationKind` + mobile-relevant kinds.
 * FCM `data` payloads use string values (see Firebase messaging docs).
 */
export type NotificationKind =
  | "partner_approval_result"
  | "event_submitted_for_review"
  | "event_approval_result"
  | "event_cancelled";

const ALLOWED: readonly NotificationKind[] = [
  "partner_approval_result",
  "event_submitted_for_review",
  "event_approval_result",
  "event_cancelled",
] as const;

export function parseNotificationKind(value: unknown): NotificationKind | null {
  if (typeof value !== "string") return null;
  return (ALLOWED as readonly string[]).includes(value)
    ? (value as NotificationKind)
    : null;
}
