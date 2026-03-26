import {
  collection,
  deleteDoc,
  doc,
  FirebaseFirestoreTypes,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
} from "@react-native-firebase/firestore";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";

import { DiscoveryScreen as DiscoveryScreenUI } from "@/screens/discovery/discovery-screen";
import { auth, db } from "@/services/authService";
import { EventDoc } from "@/types/type";

const CATEGORY_OPTIONS = [
  { key: "all", label: "All" },
  { key: "connect", label: "Connect" },
  { key: "growth", label: "Growth" },
  { key: "thrive", label: "Thrive" },
];

export default function DiscoveryScreen() {
  const router = useRouter();
  const [category, setCategory] = useState<string>("all");
  const [events, setEvents] = useState<EventDoc[]>([]);
  const [bookmarkedIds, setBookmarkedIds] = useState<Record<string, boolean>>(
    {},
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [sortOption, setSortOption] = useState("default");
  const [accessFilter, setAccessFilter] = useState("all");

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      setLoading(true);
      try {
        const eventsSnap = await getDocs(query(collection(db, "events")));
        const rows: EventDoc[] = eventsSnap.docs.map(
          (d: FirebaseFirestoreTypes.QueryDocumentSnapshot) => ({
            ...(d.data() as Omit<EventDoc, "id">),
            id: d.id,
          }),
        );
        if (mounted) setEvents(rows);

        const uid = auth.currentUser?.uid;
        if (uid) {
          const bookmarksSnap = await getDocs(
            collection(db, "users", uid, "bookmarks"),
          );
          const bookmarkMap: Record<string, boolean> = {};
          bookmarksSnap.forEach(
            (docSnap: FirebaseFirestoreTypes.QueryDocumentSnapshot) => {
              bookmarkMap[docSnap.id] = true;
            },
          );
          if (mounted) setBookmarkedIds(bookmarkMap);
        }
      } catch (e: any) {
        // Checks if the error is a permission-denied error (usually caused by the user logging out).
        // Silently returns to prevent a crash or alert as the app navigates to the login screen.
        if (e?.code === 'firestore/permission-denied' || e?.message?.includes('permission-denied')) {
          console.log("Suppressed permission error during logout in Discovery.");
          return; 
        }

        // If it is a genuine fetching error, displays an alert to the user.
        if (mounted) {
          Alert.alert("Error", e?.message ?? "Failed to load events.");
        }
      } finally {
        // setLoading function changes value of loading var to false as data is no longer being fetched.
        if (mounted) setLoading(false);
      }
    }; 

    fetchData();
    return () => {
      mounted = false;
    };
  }, []);

  // Filtering logic based on both category and access types, i.e. free and subscriber.
  // It checks if each event matches the selected category and access filter,
  // returning only those that satisfy both conditions.
  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      // Checks if the event matches the selected category filter.
      const matchesCategory =
        category === "all" ||
        (event.category ?? "").toLowerCase() === category.toLowerCase();

      // Checks if the event matches the selected access filter.
      const matchesAccess =
        accessFilter === "all" ||
        (accessFilter === "free" && event.type === "free") ||
        (accessFilter === "subscriber" && event.type !== "free");

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
    }
    // Default returns original filtered order
    return sorted;
  }, [filteredEvents, sortOption]);

  const handleBookmark = async (event: EventDoc) => {
    const uid = auth.currentUser?.uid;
    if (!uid) return Alert.alert("Sign In", "Please log in to save events.");

    const isBookmarked = !!bookmarkedIds[event.id];
    const bookmarkRef = doc(db, "users", uid, "bookmarks", event.id);

    setBookmarkedIds((prev) => {
      const next = { ...prev };
      isBookmarked ? delete next[event.id] : (next[event.id] = true);
      return next;
    });

    try {
      if (isBookmarked) await deleteDoc(bookmarkRef);
      else
        await setDoc(bookmarkRef, {
          eventId: event.id,
          title: event.title ?? "Unknown",
          savedAt: serverTimestamp(),
        });
    } catch (e) {
      setBookmarkedIds((prev) => {
        const next = { ...prev };
        isBookmarked ? (next[event.id] = true) : delete next[event.id];
        return next;
      });
      Alert.alert("Error", "Could not update bookmark.");
    }
  };

  return (
    <DiscoveryScreenUI
      filteredEvents={sortedEvents}
      loading={loading}
      bookmarkedIds={bookmarkedIds}
      onBookmark={handleBookmark}
      onCardPress={(item: EventDoc) => {
        router.push({
          pathname: "/event/event-details",
          params: { id: item.id },
        } as any);
      }}
      onRsvp={(item: EventDoc) => {
        router.push({
          pathname: "/event/event-details",
          params: { id: item.id },
        } as any);
      }}
      category={category}
      setCategory={setCategory}
      options={CATEGORY_OPTIONS}
      // Future props for sorting
      sortOption={sortOption}
      onSelectSort={(sort: string) => setSortOption(sort)}
    />
  );
}
