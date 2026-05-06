import { logCustomEvent } from "@/components/utils";
import { useBookmarks } from "@/context/GlobalContext";
import EventDetailUI from "@/screens/event/event-details-UI"; // Default import will clean up other screens later.
import { db } from "@/services/authService";
import { EventDoc } from "@/types/type";
import { doc, getDoc } from "@react-native-firebase/firestore";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert } from "react-native";

/**
 * @summary Loads event details and bookmark state, then binds detail actions for the event UI.
 * @throws {never} Errors are handled through alerts/logging.
 * @Returns {React.JSX.Element} Event details screen container.
 */
export default function EventDetailScreen() {
  // Stores the navigation tool to allow moving between screens.
  const router = useRouter();
  // Catches the unique event ID from the navigation parameters and stores it in the eventId var.
  const { id } = useLocalSearchParams();
  const eventId = id as string;

  // Bookmark UI uses the same global bookmark map + toggle as EventCard / discovery (users/{uid}/bookmarks).
  const { bookmarkedIds, toggleBookmark } = useBookmarks();

  // Stores the fetched event payload from Firestore and loading state.
  const [event, setEvent] = useState<EventDoc | null>(null);
  const [loading, setLoading] = useState(true);

  // Whether this event id appears in bookmarkedIds (keeps Profile Bookmarks list in sync with detail screen).
  const isBookmarked = eventId ? !!bookmarkedIds[eventId] : false;

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
          } as EventDoc);
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

  // Stores the function instructions for the handleBookmark var.
  /**
   * @summary Toggles bookmark for the current event using global toggleBookmark (same as event cards).
   * @throws {never} Errors are handled with alert feedback.
   * @Returns {Promise<void>} Resolves when bookmark toggle completes.
   */
  const handleBookmark = async () => {
    if (!event) return;
    try {
      const wasBookmarked = !!bookmarkedIds[event.id];
      await toggleBookmark(event);
      if (!wasBookmarked) {
        void logCustomEvent(null, "event_bookmark", {
          content_type: "event",
          item_id: event.id,
          action: "bookmark",
        });
      }
    } catch (e) {
      Alert.alert("Error", "Could not update bookmark.");
    }
  };

  /**
   * @summary Navigates back to the previous route.
   * @throws {never} Navigation call does not throw synchronously.
   * @Returns {void} Returns to prior screen.
   */
  const handleBack = () => {
    router.back();
  };

  // Stores the function instructions for handleBook var.
  // Checks if the event is free and has a valid ID. If so, navigates to the
  // booking screen with the event ID as a parameter.
  /**
   * @summary Starts the booking flow for eligible events.
   * @throws {never} Validation failures are shown via alerts.
   * @Returns {void} Navigates to booking when allowed.
   */
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
    void logCustomEvent(null, "event_book_click", {
      content_type: "event",
      item_id: event.id,
      action: "book_click",
    });
  };

  // Passes the event, loading state, bookmark flags, and action handlers to the event-details UI.
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
