import React, { useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";
import {
  collection,
  doc,
  getDocs,
  deleteDoc,
  query,
  FirebaseFirestoreTypes, setDoc, serverTimestamp
} from "@react-native-firebase/firestore";
import {useRouter} from "expo-router";
import { auth, db } from "@/services/authService"
import { EventDoc } from "@/types/type";
import { SavedEventsUI } from "@/screens/profile/saved-events-UI";

/**
   * @summary Displays a user's bookmarked events (saved events) from Firestore and automactically updates the UI when an user deletes or adds bookmark.
   */
export default function SavedEventsRoute() {
  
  const router = useRouter();
  // Stores the array of all available events from the database in the allEvents var.
  const [allEvents, setAllEvents] = useState<EventDoc[]>([]);
  // Stores an object map of the event IDs the user has saved in the bookmarkedIds var.
  const [bookmarkedIds, setBookmarkedIds] = useState<Record<string, boolean>>({});
  
  // Stores a boolean in the loading var to track the background data fetching.
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      setLoading(true);
      try {
        const uid = auth.currentUser?.uid;
        if (!uid) return;

        // Fetch ALL events from the event collection and store them in eventRows var.
        const eventsSnap = await getDocs(query(collection(db, "events")));
        const eventRows: EventDoc[] = eventsSnap.docs.map(
          (d: FirebaseFirestoreTypes.QueryDocumentSnapshot): EventDoc => {
            const data = d.data() as Omit<EventDoc, 'id'>; 
            return { ...data, id: d.id };
          }
        );
        if (mounted) setAllEvents(eventRows);

        // Fetch the Doc IDs of the events this specific user has bookmarked and store in bookmarksSnap var.
        const bookmarksSnap = await getDocs(collection(db, "users", uid, "bookmarks"));
        const bookmarkMap: Record<string, boolean> = {};
        bookmarksSnap.forEach((docSnap: FirebaseFirestoreTypes.QueryDocumentSnapshot) => {
          bookmarkMap[docSnap.id] = true;
        });
        if (mounted) setBookmarkedIds(bookmarkMap);
      } catch (e: any) {
        Alert.alert("Error", "Failed to load your bookmarks.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();
    return () => { mounted = false; };
  }, []);

  // Stores the resulting filtered array in the bookmarkedEvents var.
  const bookmarkedEvents = useMemo(() => {
    return allEvents.filter(event => !!bookmarkedIds[event.id]);
  }, [allEvents, bookmarkedIds]);
  
  // Stores function instructions handleRemoveBookmark var.
  const handleRemoveBookmark = async (event: EventDoc) => {
    // Stores the user's UID from FirebaseAuth in the uid var.
    const uid = auth.currentUser?.uid;

    // Stops the function and alerts the user if they are not logged in.
    if (!uid) return Alert.alert("Sign In", "Please log in to save events.");

    // Checks the bookmarkedIds var to see if the event is already bookmarked.
    const isBookmarked = !!bookmarkedIds[event.id];

    // Stores the specific Firestore path for the bookmark in the bookmarkRef var.
    const bookmarkRef = doc(db, "users", uid, "bookmarks", event.id);

    // Updates the UI state immediately for a faster user experience.
    setBookmarkedIds((prev) => {
      const next = { ...prev };
      isBookmarked ? delete next[event.id] : (next[event.id] = true);
      return next;
    });

    try {
      // Deletes the document if it was already saved, otherwise creates a new one.
      if (isBookmarked) await deleteDoc(bookmarkRef);
      else
        await setDoc(bookmarkRef, {
          eventId: event.id,
          title: event.title ?? "Unknown",
          savedAt: serverTimestamp(),
        });
    } catch (e) {
      // Reverts the UI state if the Firestore operation fails.
      setBookmarkedIds((prev) => {
        const next = { ...prev };
        isBookmarked ? (next[event.id] = true) : delete next[event.id];
        return next;
      });
      Alert.alert("Error", "Could not update bookmark.");
    }
  };

  return (
    // Passes the values of bookmarkedEvents, loading, handleRemoveBoomark
    // and navigation instructions to the saved events screen.
    <SavedEventsUI
      events={bookmarkedEvents}
      loading={loading}
      onBack={() => router.back()}
      onPressCard={(item) => router.push({
        pathname: "/event/event-details",
        params: {
          id: item.id,
        },
      } as any)}
      onRemoveBookmark={handleRemoveBookmark}
      onRsvp={(item) =>
        router.push({
          pathname: "/event/booking",
          params: { eventId: item.id },
        } as any)
      }
    />
  );
}