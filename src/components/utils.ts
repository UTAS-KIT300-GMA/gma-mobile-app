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
        if (typeof value?.toDate === "function") {
            return value.toDate().toLocaleString();
        }
        if (typeof value === "string") {
            const d = new Date(value);
            if (!Number.isNaN(d.getTime())) return d.toLocaleString();
            return value;
        }
        return String(value);
    } catch {
        return "";
    }
}