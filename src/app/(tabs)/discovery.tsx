/**
 **DISCOVERY ROUTE**
 * This file handles the logic for the event discovery screen.
 * It manages fetching all events, filtering them by category or access,
 * sorting the results, and toggling user bookmarks.
 */
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { Alert } from "react-native";

import { calculateHaversineDistance } from "@/components/utils";
import { useAppLocation, useBookmarks, useEvents } from "@/context/GlobalContext";
import { DiscoveryScreenUI } from "@/screens/discovery/discovery-screen";
import { EventDoc } from "@/types/type";

/**
 * @summary Calculates distance from user coordinates to an event location.
 * @param event - Event containing optional location coordinates.
 * @param userLat - User latitude.
 * @param userLon - User longitude.
 * @throws {never} Pure calculation does not throw.
 * @Returns {number} Distance in kilometers or Infinity when coordinates are missing.
 */
function distanceToEventKm(
  event: EventDoc,
  userLat: number,
  userLon: number,
): number {
  const loc = event.location as { latitude?: number; longitude?: number } | undefined;
  if (
    !loc ||
    typeof loc.latitude !== "number" ||
    typeof loc.longitude !== "number"
  ) {
    return Infinity;
  }
  return calculateHaversineDistance(userLat, userLon, loc.latitude, loc.longitude);
}

// Defines the category filters used in top nav.
const CATEGORY_OPTIONS = [
  { key: "all", label: "All" },
  { key: "connect", label: "Connect" },
  { key: "grow", label: "Grow" },
  { key: "thrive", label: "Thrive" },
];

/**
 * @summary Filters, sorts, and maps discovery events with bookmark actions for the UI.
 * @throws {never} Errors are handled through alert feedback.
 * @Returns {React.JSX.Element} Discovery screen container.
 */
export default function DiscoveryScreen() {
  const router = useRouter();
  const [category, setCategory] = useState<string>("all");
  const [sortOption, setSortOption] = useState("default");
  const [accessFilter, setAccessFilter] = useState("all");
  const [isApplyingLocationSort, setIsApplyingLocationSort] = useState(false);

  const { events, isLoading: isEventsLoading } = useEvents();
  const { bookmarkedIds, isLoading: isBookmarksLoading, toggleBookmark } = useBookmarks();
  const { coords, isLocationOn, isLocationLoading, refreshLocation } = useAppLocation();

  const debugLog = useMemo(
    () =>
      (
        hypothesisId: "H1" | "H2" | "H3" | "H4",
        location: string,
        message: string,
        data: Record<string, unknown>,
      ) => {
        console.log("[discovery-track]", {
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

  React.useEffect(() => {
    debugLog("H2", "discovery.tsx:location-state", "discovery location state", {
      isLocationOn,
      isLocationLoading,
      latitude: coords.latitude,
      longitude: coords.longitude,
    });
  }, [coords.latitude, coords.longitude, isLocationLoading, isLocationOn]);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      // Checks if the event matches the selected category filter.
      const matchesCategory =
        category === "all" ||
        (event.category ?? "").toLowerCase() === category.toLowerCase();

      // Checks if the event matches the selected access filter.
      const matchesAccess =
        accessFilter === "all" ||
        (accessFilter === "free" && event.type?.toLowerCase() === "free") ||
        (accessFilter === "subscriber" && event.type?.toLowerCase() !== "free");


      return matchesCategory && matchesAccess;
    });
  }, [events, category, accessFilter]);

  // Sorting logic based on the selected sort option.
  // Currently supports sorting by time (ascending and descending).
  const sortedEvents = useMemo(() => {
    const sorted = [...filteredEvents];

    if (sortOption === "time_asc") {
      sorted.sort(
        (a, b) => a.dateTime.toDate().getTime() - b.dateTime.toDate().getTime(),
      );
    } else if (sortOption === "time_desc") {
      sorted.sort(
        (a, b) => b.dateTime.toDate().getTime() - a.dateTime.toDate().getTime(),
      );
    } else if (sortOption === "location_nearest" && isLocationOn) {
      sorted.sort((a, b) => {
        const distA = distanceToEventKm(a, coords.latitude, coords.longitude);
        const distB = distanceToEventKm(b, coords.latitude, coords.longitude);
        return distA - distB;
      });
    } else if (sortOption === "location_furthest" && isLocationOn) {
      sorted.sort((a, b) => {
        const distA = distanceToEventKm(a, coords.latitude, coords.longitude);
        const distB = distanceToEventKm(b, coords.latitude, coords.longitude);
        return distB - distA;
      });
    }
    return sorted;
  }, [
    filteredEvents,
    sortOption,
    coords.latitude,
    coords.longitude,
    isLocationOn,
  ]);

  React.useEffect(() => {
    debugLog("H1", "discovery.tsx:sort-change", "sort state changed", {
      sortOption,
      accessFilter,
      eventCount: sortedEvents.length,
      isLocationOn,
      latitude: coords.latitude,
      longitude: coords.longitude,
    });
  }, [
    accessFilter,
    coords.latitude,
    coords.longitude,
    isLocationOn,
    sortOption,
    sortedEvents.length,
  ]);

  const handleSelectSort = async (nextSort: string) => {
    debugLog("H1", "discovery.tsx:handleSelectSort", "user selected sort option", {
      prevSortOption: sortOption,
      nextSortOption: nextSort,
      isLocationSort: nextSort.startsWith("location_"),
      isLocationOn,
      latitude: coords.latitude,
      longitude: coords.longitude,
    });

    if (!nextSort.startsWith("location_")) {
      setSortOption(nextSort);
      return;
    }

    setIsApplyingLocationSort(true);
    try {
      const result = await refreshLocation({
        forceFresh: true,
        maxAgeMs: 60 * 1000,
      });

      debugLog("H2", "discovery.tsx:handleSelectSort:refresh-result", "refreshLocation result", {
        isLocationOn: result.isLocationOn,
        error: result.error,
        latitude: result.coords.latitude,
        longitude: result.coords.longitude,
      });

      if (!result.isLocationOn) {
        Alert.alert(
          "Location unavailable",
          result.error || "Enable location services to sort by distance.",
        );
        return;
      }

      setSortOption(nextSort);
    } catch (error) {
      debugLog("H4", "discovery.tsx:handleSelectSort:error", "location sort refresh failed", {
        message: error instanceof Error ? error.message : String(error),
      });
      Alert.alert("Location unavailable", "Could not refresh location right now.");
    } finally {
      setIsApplyingLocationSort(false);
    }
  };

  /**
   * @summary Saves or removes an event from the user's bookmark sub collection.
   * @param event - The specific event data to be bookmarked or removed.
   * @throws {never} Errors are handled with alert feedback.
   * @Returns {Promise<void>} Resolves when bookmark toggle completes.
   */
  const handleBookmark = async (event: EventDoc) => {
    try {
      await toggleBookmark(event);
    } catch (e) {
      Alert.alert("Error", "Could not update bookmark.");
    }
  };

  return (
      <DiscoveryScreenUI
          filteredEvents={sortedEvents}
          loading={isEventsLoading || isBookmarksLoading}
          bookmarkedIds={bookmarkedIds}
          onBookmark={handleBookmark}
          onCardPress={(item: EventDoc) => {
            router.push({ pathname: "/event/event-details", params: { id: item.id } } as any);
          }}
          onRsvp={(item: EventDoc) => {
            router.push({ pathname: "/event/booking", params: { eventId: item.id } } as any);
          }}
          category={category}
          setCategory={setCategory}
          options={CATEGORY_OPTIONS}
          sortOption={sortOption}
          onSelectSort={handleSelectSort}
          accessFilter={accessFilter}
          onSelectAccessFilter={setAccessFilter}
          isLocationOn={isLocationOn}
          isLocationLoading={isLocationLoading}
          isApplyingLocationSort={isApplyingLocationSort}
          onOpenLocationSettings={() => {
            router.push("/(profile)/location-settings-logic" as any);
          }}
      />
  );
}