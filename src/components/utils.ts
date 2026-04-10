import {EVENT_CATEGORIES, EventDoc} from "@/types/type.ts";

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

/**
 * Calculates the distance between two points in kilometers
 */
export function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);

  const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

export const normalize = (v: string) => v.trim().toLowerCase();

export const getParentCategoryFromTagName = (
    tagName: string,
): EventDoc["category"] | null => {
  const needle = normalize(tagName);
  for (const group of EVENT_CATEGORIES) {
    if (group.items.some((item) => normalize(item.name) === needle)) {
      const name = normalize(group.category);
      if (name === "connect") return "connect";
      if (name === "grow") return "growth";
      if (name === "thrive") return "thrive";
      return null;
    }
  }
  return null;
};