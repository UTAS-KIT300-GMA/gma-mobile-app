import EventDetailUI from "@/screens/event/event-details-UI"; // Default import will clean up other screens later.
import { auth, db } from "@/services/authService";
import {
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "@react-native-firebase/firestore";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert } from "react-native";

export default function EventDetailScreen() {
  const router = useRouter();
  // Catches the unique event ID from the navigation parameters.
  // Stores it in the eventId var.
  const { id } = useLocalSearchParams();
  const eventId = id as string;

  // Stores the fetched event details, bookmark status, and loading state in vars.
  const [event, setEvent] = useState<any>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function fetchEvent() {
      if (!eventId) return;
      try {
        // Defines the path to the specific event in the 'events' collection.
        const eventRef = doc(db, "events", eventId);
        const eventSnap = await getDoc(eventRef);

        if (eventSnap.exists() && mounted) {
          const data = eventSnap.data();

          // Logs the fetched event data for debugging purposes.
          console.log("Fetched event data:", data?.location);

          // Determines the event type based on ticket prices. If both member and non-member prices are 0, it's a free event; otherwise, it's paid.
          const memberPrice = data?.ticketPrices?.member ?? 0;
          const nonMemberPrice = data?.ticketPrices?.nonMember ?? 0;

          const derivedType =
            memberPrice === 0 && nonMemberPrice === 0 ? "free" : "paid";

          // Stores the combined ID and data in the event var.
          setEvent({
            id: eventSnap.id,
            ...data,
            type: derivedType,
          });
        }

        const uid = auth.currentUser?.uid;
        if (uid && mounted) {
          // Checks the user's private 'bookmarks' collection for this specific event ID.
          const bookmarkSnap = await getDoc(
            doc(db, "users", uid, "bookmarks", eventId),
          );
          // Stores the true/false result in the isBookmarked var.
          setIsBookmarked(bookmarkSnap.exists());
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchEvent();
    return () => {
      mounted = false;
    };
  }, [eventId]);

  // Stores the function instructions for handleBookmark var.
  const handleBookmark = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    const bookmarkRef = doc(db, "users", uid, "bookmarks", eventId);
    const wasBookmarked = isBookmarked;
    setIsBookmarked(!wasBookmarked);
    try {
      // If already saved, delete the doc. If not, create a new one with a timestamp.
      if (wasBookmarked) await deleteDoc(bookmarkRef);
      else await setDoc(bookmarkRef, { eventId, savedAt: serverTimestamp() });
    } catch (e) {
      // If the database fails, roll back the local isBookmarked store to its original state.
      setIsBookmarked(wasBookmarked);
      Alert.alert("Error", "Could not update bookmark.");
    }
  };

  const handleBack = () => {
    router.back();
  };

  // Stores the function instructions for handleBook var.
  // Checks if the event is free and has a valid ID. If so, navigates to the
  // booking screen with the event ID as a parameter.
  const handleBook = () => {
    if (!event?.id) {
      Alert.alert("Error", "Event booking is not available.");
      return;
    }

    if (event.type !== "free") {
      Alert.alert(
        "Subscribers Only",
        "This event is available to subscribed members only.",
      );
      return;
    }

    router.push({
      pathname: "/event/booking",
      params: { eventId: event.id },
    } as any);
  };

  return (
    <EventDetailUI
      event={event}
      loading={loading}
      isBookmarked={isBookmarked}
      onBookmark={handleBookmark}
      onBack={handleBack}
      onBook={handleBook}
    />
  );
}
