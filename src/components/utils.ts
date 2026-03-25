export function formatDateTime(value: any): string {
  /**
   * Formats a date value into a human-readable string.
   *
   * Parameters:
   * value - Can be a Firebase Timestamp, a Date string, or an object.
   *
   * Outcome:
   * Returns a localized date string (e.g., "MM/DD/YYYY, HH:MM AM/PM")
   * or an empty string if the value is invalid.
   */
  try {
    if (!value) return "";

    let date: Date | null = null;

    // Firebase Timestamp
    if (typeof value?.toDate === "function") {
      date = value.toDate();
    }

    // String date
    else if (typeof value === "string") {
      const d = new Date(value);
      if (!Number.isNaN(d.getTime())) date = d;
    }

    if (!date) return "";

    const datePart = date.toLocaleDateString([], {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    const timePart = date.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });

    return `${datePart} • ${timePart}`;
  } catch {
    return "";
  }
}
