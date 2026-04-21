import {EVENT_CATEGORIES, EventDoc} from "@/types/type.ts";
import * as ExpoLinking from "expo-linking";
import * as Location from "expo-location";
import { Platform, Linking as RNLinking } from "react-native";

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
      if (name === "grow") return "grow";
      if (name === "thrive") return "thrive";
      return null;
    }
  }
  return null;
};

export type LocationFetchResult = {
  error: string | null;
  coords: { latitude: number; longitude: number };
  isLocationOn: boolean;
};

/** Fallback coordinates when none are available (shared with global location state). */
export const DEFAULT_LOCATION_COORDS = {
  latitude: -42.8821,
  longitude: 147.3272,
};

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Permission + system location services only (no GPS fix). Use for global “location on” UI state.
 */
export async function resolveLocationStatus(): Promise<{
  isLocationOn: boolean;
  error: string | null;
}> {
  try {
    let { status } = await Location.getForegroundPermissionsAsync();
    if (status === "undetermined") {
      const requested = await Location.requestForegroundPermissionsAsync();
      status = requested.status;
    }
    if (status !== "granted") {
      return { isLocationOn: false, error: "Permission denied." };
    }
    const servicesEnabled = await Location.hasServicesEnabledAsync();
    if (!servicesEnabled) {
      return { isLocationOn: false, error: "Location services off" };
    }
    return { isLocationOn: true, error: null };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Location unavailable";
    const enabled = await Location.hasServicesEnabledAsync().catch(() => false);
    return {
      isLocationOn: false,
      error: !enabled ? "Location services off" : message,
    };
  }
}

/**
 * Best-effort coordinates after status is already “on”. Retries once like the original flow.
 * Fixed priority of returned coordinates: GPS > cached last known > default.
 * i.e. current → retry current → last known → default coords. 
 */
export async function fetchLocationCoordinates(): Promise<{
  coords: { latitude: number; longitude: number };
}> {
  const readOnce = async () => {
    const current = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
      mayShowUserSettingsDialog: false,
    });
    return current.coords;
  };

  try {
    const coords = await readOnce();
    return { coords };
  } catch {
    await sleep(850);
    try {
      const coords = await readOnce();
      return { coords };
    } catch {
      // Last resort: use cached position if available, otherwise default
      const lastKnown = await Location.getLastKnownPositionAsync().catch(
        () => null,
      );
      return { coords: DEFAULT_LOCATION_COORDS };
    }
  }
}
