
import React, { useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";
import { 
  collection, doc, getDocs, setDoc, deleteDoc, serverTimestamp, query, FirebaseFirestoreTypes 
} from "@react-native-firebase/firestore";
import { useRouter } from "expo-router";

import { auth, db } from "@/services/authService"; 
import { EventDoc } from "@/types/type";
import { DiscoveryScreen as DiscoveryScreenUI } from "@/screens/discovery/discovery-screen";

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
  const [bookmarkedIds, setBookmarkedIds] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      setLoading(true);
      try {
        const eventsSnap = await getDocs(query(collection(db, "events")));
        const rows: EventDoc[] = eventsSnap.docs.map(
          (d: FirebaseFirestoreTypes.QueryDocumentSnapshot) => ({ ...(d.data() as Omit<EventDoc, 'id'>), id: d.id })
        );
        if (mounted) setEvents(rows);

        const uid = auth.currentUser?.uid;
        if (uid) {
          const bookmarksSnap = await getDocs(collection(db, "users", uid, "bookmarks"));
          const bookmarkMap: Record<string, boolean> = {};
          bookmarksSnap.forEach((docSnap: FirebaseFirestoreTypes.QueryDocumentSnapshot) => { bookmarkMap[docSnap.id] = true; });
          if (mounted) setBookmarkedIds(bookmarkMap);
        }
      } catch (e: any) {
        Alert.alert("Error", e?.message ?? "Failed to load events.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();
    return () => { mounted = false; };
  }, []);

  const filteredEvents = useMemo(() => {
    if (category === "all") return events;
    return events.filter(e => (e.category ?? "").toLowerCase() === category.toLowerCase());
  }, [category, events]);

  const handleBookmark = async (event: EventDoc) => {
    const uid = auth.currentUser?.uid;
    if (!uid) return Alert.alert("Sign In", "Please log in to save events.");

    const isBookmarked = !!bookmarkedIds[event.id];
    const bookmarkRef = doc(db, "users", uid, "bookmarks", event.id);

    setBookmarkedIds(prev => {
      const next = { ...prev };
      isBookmarked ? delete next[event.id] : (next[event.id] = true);
      return next;
    });

    try {
      if (isBookmarked) await deleteDoc(bookmarkRef);
      else await setDoc(bookmarkRef, { eventId: event.id, title: event.title ?? "Unknown", savedAt: serverTimestamp() });
    } catch (e) {
      setBookmarkedIds(prev => {
        const next = { ...prev };
        isBookmarked ? (next[event.id] = true) : delete next[event.id];
        return next;
      });
      Alert.alert("Error", "Could not update bookmark.");
    }
  };

  return (
    
    
    <DiscoveryScreenUI
      filteredEvents={filteredEvents}
      loading={loading}
      bookmarkedIds={bookmarkedIds}
      onBookmark={handleBookmark}
      
      
      onCardPress={(item: EventDoc) => {
        router.push({ pathname: "/event/event-details", params: { id: item.id } } as any);
      }}
      onRsvp={(item: EventDoc) => {
        router.push({ pathname: "/event/event-details", params: { id: item.id } } as any);
      }}
      
      category={category}
      setCategory={setCategory}
      options={CATEGORY_OPTIONS}
    />
  
  );
}