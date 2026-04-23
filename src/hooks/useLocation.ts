import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { AppStateStatus } from "react-native";
import { AppState } from "react-native";

import type { LocationFetchResult } from "@/components/utils";
import {
  DEFAULT_LOCATION_COORDS,
  fetchLocationCoordinates,
  resolveLocationStatus,
} from "@/components/utils";
import type { LocationSlice } from "@/context/GlobalContext";

/**
 * @summary Resolves device location permission and coordinates, refreshing automatically when the app returns to the foreground.
 */
export function useLocationInternal(): LocationSlice {
  const [coords, setCoords] = useState(DEFAULT_LOCATION_COORDS);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLocationOn, setIsLocationOn] = useState(false);
  const [isLocationLoading, setIsLocationLoading] = useState(true);

  const inFlightRef = useRef<Promise<LocationFetchResult> | null>(null);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  const lastResumeRefreshRef = useRef(0);

  const refreshLocation = useCallback(async (): Promise<LocationFetchResult> => {
    if (inFlightRef.current) return inFlightRef.current;

    const promise = (async (): Promise<LocationFetchResult> => {
      setIsLocationLoading(true);
      try {
        const status = await resolveLocationStatus();
        setIsLocationOn(status.isLocationOn);
        setLocationError(status.error);

        if (!status.isLocationOn) {
          return {
            error: status.error,
            coords: DEFAULT_LOCATION_COORDS,
            isLocationOn: false,
          };
        }
      } finally {
        setIsLocationLoading(false);
      }

      const { coords } = await fetchLocationCoordinates();
      setCoords((prev) =>
        prev.latitude === coords.latitude && prev.longitude === coords.longitude
          ? prev
          : coords,
      );
      return { error: null, coords, isLocationOn: true };
    })();

    inFlightRef.current = promise;
    return promise.finally(() => {
      inFlightRef.current = null;
    });
  }, []);

  useEffect(() => {
    void refreshLocation();
  }, [refreshLocation]);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (next) => {
      const prev = appStateRef.current;
      appStateRef.current = next;

      const wasBackgrounded = /inactive|background/.test(prev);

      if (wasBackgrounded && next === "active") {
        const now = Date.now();
        if (now - lastResumeRefreshRef.current < 900) return;
        lastResumeRefreshRef.current = now;
        setTimeout(() => {
          void refreshLocation();
        }, 750);
      }
    });
    return () => sub.remove();
  }, [refreshLocation]);

  return useMemo(
      () => ({
        coords,
        locationError,
        isLocationOn,
        isLocationLoading,
        refreshLocation,
      }),
      [coords, locationError, isLocationOn, isLocationLoading, refreshLocation],
  );
}