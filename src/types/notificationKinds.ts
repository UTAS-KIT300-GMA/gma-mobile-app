/**
 * NotificationKind lists every valid kind as a type.
 * ALLOWED is the same list as values so we can validate strings at runtime.
 * If you add a kind, add it to both.
 */
export type NotificationKind =
  | "event_cancelled"
  | "event_edited"
  | "event_booking_confirmed"
  | "subscription_confirmed"
  | "subscription_cancelled"
  | "event_reminder_2days"
  | "event_reminder_1day"

const ALLOWED: readonly NotificationKind[] = [
  "event_cancelled",
  "event_edited",
  "event_booking_confirmed",
  "subscription_confirmed",
  "subscription_cancelled",
  "event_reminder_2days",
  "event_reminder_1day",
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
