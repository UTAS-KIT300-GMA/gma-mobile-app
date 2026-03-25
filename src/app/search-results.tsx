import { SearchResultsScreen } from "@/screens/search/search-results-screen";
import { auth, db } from "@/services/authService";
import { EventDoc, InterestKey } from "@/types/type";
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
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";

/*
This screen retrieves the search parameters from the URL, fetches all events 
from Firestore, and applies client-side filtering based on the search criteria. 

It also manages bookmark states for each event and allows users to toggle 
bookmarks, which updates Firestore accordingly. 

The filtered results are then passed to the DiscoveryScreenUI for display.
*/

export default function SearchResultsLogic() {
  const router = useRouter();

  const params = useLocalSearchParams<{
    query?: string;
    location?: string;
    date?: string;
    tags?: string;
  }>();

  // State variables to hold events, bookmark statuses, and loading state.
  const [events, setEvents] = useState<EventDoc[]>([]);
  const [bookmarkedIds, setBookmarkedIds] = useState<Record<string, boolean>>(
    {},
  );
  const [loading, setLoading] = useState(true);

  const searchQuery =
    typeof params.query === "string" ? params.query.trim() : "";

  const locationQuery =
    typeof params.location === "string" ? params.location.trim() : "";

  const selectedDate =
    typeof params.date === "string" && params.date
      ? new Date(params.date)
      : null;

  const selectedTags: InterestKey[] =
    typeof params.tags === "string" && params.tags.length > 0
      ? (params.tags.split(",") as InterestKey[])
      : [];

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      setLoading(true);
      // Fetches all events from Firestore and the user's bookmarks,
      // then updates state.
      try {
        const eventsSnap = await getDocs(query(collection(db, "events")));

        const rows: EventDoc[] = eventsSnap.docs.map(
          (d: FirebaseFirestoreTypes.QueryDocumentSnapshot) => ({
            ...(d.data() as Omit<EventDoc, "id">),
            id: d.id,
          }),
        );

        if (mounted) {
          setEvents(rows);
        }

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

          if (mounted) {
            setBookmarkedIds(bookmarkMap);
          }
        }
      } catch (e: any) {
        Alert.alert("Error", e?.message ?? "Failed to load search results.");
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, []);

  // Applies client-side filtering to the fetched events based on the
  // search query, location, date, and selected tags.
  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const eventDate = event.dateTime.toDate();
      // Creates a string representation of the event date in various formats
      // Formats include: "March", "Mar", "2026", "March 2026", "Mar 2026", "25 March 2026"
      const dateSearchText = [
        eventDate.toLocaleDateString("en-AU", { month: "long" }), // March
        eventDate.toLocaleDateString("en-AU", { month: "short" }), // Mar
        eventDate.toLocaleDateString("en-AU", { year: "numeric" }), // 2026
        eventDate.toLocaleDateString("en-AU", {
          month: "long",
          year: "numeric",
        }), // March 2026
        eventDate.toLocaleDateString("en-AU", {
          month: "short",
          year: "numeric",
        }), // Mar 2026
        eventDate.toLocaleDateString("en-AU", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }), // 25 March 2026
      ]
        .join(" ")
        .toLowerCase();

      const searchableText = [
        event.title ?? "",
        event.description ?? "",
        event.address ?? "",
        event.category ?? "",
        event.type ?? "",
        dateSearchText,
      ]
        .join(" ")
        .toLowerCase();

      // Splits the search query into individual keywords for more flexible matching.
      const queryKeywords = searchQuery
        .toLowerCase()
        .split(/\s+/)
        .map((word) => word.trim())
        .filter(Boolean);

      // Match if ANY keyword appears in event fields.
      const matchesQuery =
        queryKeywords.length === 0 ||
        queryKeywords.some((keyword) => searchableText.includes(keyword));

      const matchesLocation =
        !locationQuery ||
        (event.address ?? "")
          .toLowerCase()
          .includes(locationQuery.toLowerCase());

      const matchesDate =
        !selectedDate ||
        isSameCalendarDate(event.dateTime.toDate(), selectedDate);

      const matchesTags =
        selectedTags.length === 0 ||
        selectedTags.some(
          (tag) => normalizeText(event.category) === normalizeText(tag),
        );

      return matchesQuery && matchesLocation && matchesDate && matchesTags;
    });
  }, [events, searchQuery, locationQuery, selectedDate, selectedTags]);

  const handleBookmark = async (event: EventDoc) => {
    const uid = auth.currentUser?.uid;

    if (!uid) {
      return Alert.alert("Sign In", "Please log in to save events.");
    }

    const isBookmarked = !!bookmarkedIds[event.id];
    const bookmarkRef = doc(db, "users", uid, "bookmarks", event.id);

    setBookmarkedIds((prev) => {
      const next = { ...prev };
      if (isBookmarked) {
        delete next[event.id];
      } else {
        next[event.id] = true;
      }
      return next;
    });

    try {
      if (isBookmarked) {
        await deleteDoc(bookmarkRef);
      } else {
        await setDoc(bookmarkRef, {
          eventId: event.id,
          title: event.title ?? "Unknown",
          savedAt: serverTimestamp(),
        });
      }
    } catch {
      setBookmarkedIds((prev) => {
        const next = { ...prev };
        if (isBookmarked) {
          next[event.id] = true;
        } else {
          delete next[event.id];
        }
        return next;
      });

      Alert.alert("Error", "Could not update bookmark.");
    }
  };

  return (
    <SearchResultsScreen
      events={filteredEvents}
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
      onBack={() => router.back()}
      title="Search Results"
    />
  );
}

// Helper function to normalise text for consistent comparisons.
function normalizeText(value: string | undefined): string {
  return (value ?? "").trim().toLowerCase();
}

// Helper function to check if two dates are on the same calendar day.
function isSameCalendarDate(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
