import {EVENT_CATEGORIES, EventDoc} from "@/types/type.ts";
import * as ExpoLinking from "expo-linking";
import * as Location from "expo-location";
import { Platform, Linking as RNLinking } from "react-native";

/**
 * @summary Formats a Firebase Timestamp or date string into a human-readable date and time string.
 * @param value - A Firebase Timestamp, ISO date string, or any date-like value to format.
 */
export function formatDateTime(value: any): string {
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
 * @summary Calculates the great-circle distance in kilometres between two geographic coordinates using the Haversine formula.
 * @param lat1 - Latitude of the first point in decimal degrees.
 * @param lon1 - Longitude of the first point in decimal degrees.
 * @param lat2 - Latitude of the second point in decimal degrees.
 * @param lon2 - Longitude of the second point in decimal degrees.
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

/**
 * @summary Trims whitespace and converts a string to lowercase for consistent comparisons.
 * @param v - The raw string to normalise.
 */
export const normalize = (v: string) => v.trim().toLowerCase();

/**
 * @summary Looks up the parent category ("connect" | "grow" | "thrive") for a given interest tag name.
 * @param tagName - The interest tag name to look up in the EVENT_CATEGORIES list.
 */
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

/**
 * @summary Pauses execution for a given number of milliseconds.
 * @param ms - Duration to sleep in milliseconds.
 */
const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * @summary Checks location permission and whether system location services are enabled, without performing a GPS fix.
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
 * @summary Retrieves the device's current GPS coordinates, falling back to last-known or default coordinates if the fix fails.
 */
export async function fetchLocationCoordinates(): Promise<{
  coords: { latitude: number; longitude: number };
}> {
  return fetchLocationCoordinatesWithOptions();
}

type FetchLocationOptions = {
  preferLastKnown?: boolean;
  forceFresh?: boolean;
};

/**
 * @summary Retrieves device coordinates with configurable stale-cache preference.
 * @param options - Fetch behavior flags.
 */
export async function fetchLocationCoordinatesWithOptions(
  options: FetchLocationOptions = {},
): Promise<{
  coords: { latitude: number; longitude: number };
}> {
  const { preferLastKnown = true, forceFresh = false } = options;

  const readOnce = async () => {
    const current = await Location.getCurrentPositionAsync({
      accuracy: forceFresh ? Location.Accuracy.High : Location.Accuracy.Balanced,
      mayShowUserSettingsDialog: forceFresh,
      timeInterval: forceFresh ? 0 : 1000,
      distanceInterval: forceFresh ? 0 : 10,
    });
    return current.coords;
  };

  if (preferLastKnown) {
    const lastKnown = await Location.getLastKnownPositionAsync().catch(() => null);
    if (lastKnown?.coords) {
      return {
        coords: {
          latitude: lastKnown.coords.latitude,
          longitude: lastKnown.coords.longitude,
        },
      };
    }
  }

  try {
    const coords = await readOnce();
    return { coords };
  } catch {
    await sleep(forceFresh ? 300 : 850);
    try {
      const coords = await readOnce();
      return { coords };
    } catch {
      const lastKnown = await Location.getLastKnownPositionAsync().catch(() => null);
      if (lastKnown?.coords) {
        return {
          coords: {
            latitude: lastKnown.coords.latitude,
            longitude: lastKnown.coords.longitude,
          },
        };
      }
      return { coords: DEFAULT_LOCATION_COORDS };
    }
  }
}
