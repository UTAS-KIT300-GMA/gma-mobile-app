export function formatDateTime(value: any): string {
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