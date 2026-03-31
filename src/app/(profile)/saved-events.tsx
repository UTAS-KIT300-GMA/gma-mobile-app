import React, { useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";
import { 
  collection, 
  doc, 
  getDocs, 
  deleteDoc, 
  query, 
  FirebaseFirestoreTypes 
} from "@react-native-firebase/firestore";
import { useRouter } from "expo-router";
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
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    // Removes the doc ID from bookmarks collection for an instant UI update.
    setBookmarkedIds(prev => {
      const next = { ...prev };
      delete next[event.id];
      return next;
    });

    try {
      await deleteDoc(doc(db, "users", uid, "bookmarks", event.id));
    } catch (e) {
      
      setBookmarkedIds(prev => ({ ...prev, [event.id]: true }));
      Alert.alert("Error", "Could not remove bookmark.");
    }
  };

  return (
    // Passes the values of bookmarkedEvents, loading, handleRemoveBoomark
    // and navigation instructions to the saved events screen.
    <SavedEventsUI
      events={bookmarkedEvents}
      loading={loading}
      onBack={() => router.back()}
      onPressCard={(item) => router.push(`/event/${item.id}` as any)}
      onRemoveBookmark={handleRemoveBookmark}
      onRsvp={(item) => router.push(`/event/${item.id}/book` as any)}
    />
  );
}