/**
 * NotificationKind lists every valid kind as a type.
 * ALLOWED is the same list as values so we can validate strings at runtime.
 * If you add a kind, add it to both.
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

/**
 * Turns an unknown into a NotificationKind, or null
 * if it is not a string or not in `ALLOWED`.
 */
export function parseNotificationKind(value: unknown): NotificationKind | null {
  if (typeof value !== "string") return null;
  return (ALLOWED as readonly string[]).includes(value)
    ? (value as NotificationKind)
    : null;
}
