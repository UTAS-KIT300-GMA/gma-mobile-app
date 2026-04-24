import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { AppStateStatus } from "react-native";
import { AppState } from "react-native";

import type { LocationFetchResult } from "@/components/utils";
import {
  DEFAULT_LOCATION_COORDS,
  fetchLocationCoordinates,
  fetchLocationCoordinatesWithOptions,
  resolveLocationStatus,
} from "@/components/utils";
import type { LocationSlice } from "@/context/GlobalContext";

const LOCATION_CACHE_MAX_AGE_MS = 5 * 60 * 1000;
const FORCE_FRESH_TIMEOUT_MS = 6500;

function isDefaultCoords(coords: { latitude: number; longitude: number }) {
  return (
    coords.latitude === DEFAULT_LOCATION_COORDS.latitude &&
    coords.longitude === DEFAULT_LOCATION_COORDS.longitude
  );
}

/**
 * @summary Resolves device location permission and coordinates, refreshing automatically when the app returns to the foreground.
 * @throws {never} Hook setup does not throw synchronously.
 * @Returns {LocationSlice} Memoized location state and refresh action.
 */
export function useLocationInternal(): LocationSlice {
  // Stores location values, availability state, and loading/error status.
  const [coords, setCoords] = useState(DEFAULT_LOCATION_COORDS);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLocationOn, setIsLocationOn] = useState(false);
  const [isLocationLoading, setIsLocationLoading] = useState(true);

  // Stores refs for in-flight requests and foreground refresh throttling.
  const inFlightRef = useRef<Promise<LocationFetchResult> | null>(null);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  const lastResumeRefreshRef = useRef(0);
  const lastCoordsUpdatedAtRef = useRef<number | null>(null);

  const debugLog = useMemo(
    () =>
      (
        hypothesisId: "H1" | "H2" | "H3" | "H4",
        location: string,
        message: string,
        data: Record<string, unknown>,
      ) => {
        console.log("[location-track]", {
          hypothesisId,
          location,
          message,
          ...data,
        });
        // #region agent log
        fetch("http://127.0.0.1:7316/ingest/be20241a-34d7-4f4f-a5b8-60874b5e390b", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Debug-Session-Id": "016609",
          },
          body: JSON.stringify({
            sessionId: "016609",
            runId: "run-pre-fix",
            hypothesisId,
            location,
            message,
            data,
            timestamp: Date.now(),
          }),
        }).catch(() => {});
        // #endregion
      },
    [],
  );

  const withTimeout = useCallback(
    async <T,>(promise: Promise<T>, ms: number): Promise<T> => {
      return new Promise<T>((resolve, reject) => {
        const timer = setTimeout(() => {
          reject(new Error("Location request timed out."));
        }, ms);

        promise
          .then((value) => {
            clearTimeout(timer);
            resolve(value);
          })
          .catch((err) => {
            clearTimeout(timer);
            reject(err);
          });
      });
    },
    [],
  );

  /**
   * @summary Fetches current location status and coordinates with request deduplication.
   * @throws {Error} Throws when location status or coordinate fetch fails.
   * @Returns {Promise<LocationFetchResult>} Latest location fetch result.
   */
  const refreshLocation = useCallback(
    async (
      options?: {
        forceFresh?: boolean;
        maxAgeMs?: number;
      },
    ): Promise<LocationFetchResult> => {
      const forceFresh = options?.forceFresh ?? false;
      const maxAgeMs = options?.maxAgeMs ?? LOCATION_CACHE_MAX_AGE_MS;
      const startedAt = Date.now();
      debugLog("H2", "useLocation.ts:refresh:start", "refresh started", {
        forceFresh,
        maxAgeMs,
      });

      if (!forceFresh && lastCoordsUpdatedAtRef.current && !isDefaultCoords(coords)) {
        const age = Date.now() - lastCoordsUpdatedAtRef.current;
        if (age <= maxAgeMs) {
          debugLog("H3", "useLocation.ts:refresh:cache-hit", "cache hit returns existing coords", {
            ageMs: age,
            latitude: coords.latitude,
            longitude: coords.longitude,
          });
          return { error: locationError, coords, isLocationOn };
        }
      }

      // Reuse in-flight calls only for non-forced refreshes.
      // Force-refresh should not get blocked by a stale/hung in-flight request.
      if (!forceFresh && inFlightRef.current) {
        debugLog("H4", "useLocation.ts:refresh:reuse-inflight", "reusing in-flight refresh", {});
        return inFlightRef.current;
      }

      const promise = (async (): Promise<LocationFetchResult> => {
        setIsLocationLoading(true);
        try {
          const status = await resolveLocationStatus();
          debugLog("H2", "useLocation.ts:status", "permission/service status resolved", status);
          setIsLocationOn(status.isLocationOn);
          setLocationError(status.error);

          if (!status.isLocationOn) {
            debugLog("H2", "useLocation.ts:refresh:blocked", "refresh blocked by location status", {
              error: status.error,
            });
            return {
              error: status.error,
              coords: DEFAULT_LOCATION_COORDS,
              isLocationOn: false,
            };
          }

          const { coords: nextCoords } = forceFresh
            ? await withTimeout(
                fetchLocationCoordinatesWithOptions({
                  preferLastKnown: false,
                  forceFresh: true,
                }),
                FORCE_FRESH_TIMEOUT_MS,
              ).catch(async () => {
                // If fresh GPS stalls, fall back to normal fetch so UI can proceed.
                debugLog(
                  "H4",
                  "useLocation.ts:refresh:fresh-timeout-fallback",
                  "fresh request timed out; fallback path used",
                  {},
                );
                return fetchLocationCoordinates();
              })
            : await fetchLocationCoordinates();

          setCoords((prev) =>
            prev.latitude === nextCoords.latitude && prev.longitude === nextCoords.longitude
              ? prev
              : nextCoords,
          );
          lastCoordsUpdatedAtRef.current = Date.now();
          setLocationError(null);
          debugLog("H3", "useLocation.ts:refresh:success", "refresh resolved with coords", {
            latitude: nextCoords.latitude,
            longitude: nextCoords.longitude,
            elapsedMs: Date.now() - startedAt,
            forceFresh,
          });
          return { error: null, coords: nextCoords, isLocationOn: true };
        } catch (error) {
          debugLog("H4", "useLocation.ts:refresh:error", "refresh failed", {
            message: error instanceof Error ? error.message : String(error),
            elapsedMs: Date.now() - startedAt,
          });
          throw error;
        } finally {
          setIsLocationLoading(false);
          debugLog("H2", "useLocation.ts:refresh:end", "refresh finished", {
            elapsedMs: Date.now() - startedAt,
            forceFresh,
          });
        }
      })();

      if (!forceFresh) {
        inFlightRef.current = promise;
        return promise.finally(() => {
          inFlightRef.current = null;
        });
      }

      return promise;
    },
    [coords, debugLog, isLocationOn, locationError, withTimeout],
  );

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