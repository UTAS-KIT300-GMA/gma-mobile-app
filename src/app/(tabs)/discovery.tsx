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

export default function DiscoveryScreen() {
  const router = useRouter();
  const [category, setCategory] = useState<string>("all");
  const [sortOption, setSortOption] = useState("default");
  const [accessFilter, setAccessFilter] = useState("all");

  const { events, isLoading: isEventsLoading } = useEvents();
  const { bookmarkedIds, isLoading: isBookmarksLoading, toggleBookmark } = useBookmarks();
  const { coords, isLocationOn, isLocationLoading } = useAppLocation();

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

  /**
   * @summary Saves or removes an event from the user's bookmark sub collection.
   * @param event The specific event data to be bookmarked or removed.
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
          onSelectSort={setSortOption}
          accessFilter={accessFilter}
          onSelectAccessFilter={setAccessFilter}
          isLocationOn={isLocationOn}
          isLocationLoading={isLocationLoading}
          onOpenLocationSettings={() => {
            router.push("/(profile)/location-settings-logic" as any);
          }}
      />
  );
}