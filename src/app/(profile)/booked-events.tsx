import React, { useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";
import {
  collection,
  getDocs,
  query,
  FirebaseFirestoreTypes,
} from "@react-native-firebase/firestore";
import { useRouter } from "expo-router";
import { auth, db } from "@/services/authService";
import { EventDoc, Booking } from "@/types/type";
import { BookedEventsUI } from "@/screens/profile/my-bookings-UI";

/**
 * @summary Loads the user's booking documents and joins them with event details for display.
 * @throws {never} Errors are handled with alerts and guarded state updates.
 * @Returns {React.JSX.Element} Booked-events UI container.
 */
export default function BookedEventsRoute() {
  const router = useRouter();

  const [allEvents, setAllEvents] = useState<EventDoc[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;

    /**
     * @summary Fetches event catalog and user booking rows from Firestore.
     * @throws {never} Errors are caught and shown via alert.
     * @Returns {Promise<void>} Resolves when booking data is loaded.
     */
    const fetchData = async () => {
      setLoading(true);

      try {
        const uid = auth.currentUser?.uid;
        if (!uid) return;

        // 1. Get ALL events
        const eventsSnap = await getDocs(query(collection(db, "events")));

        const eventRows: EventDoc[] = eventsSnap.docs.map(
          (d: FirebaseFirestoreTypes.QueryDocumentSnapshot) => {
            const data = d.data() as Omit<EventDoc, "id">;
            return { ...data, id: d.id };
          }
        );

        if (mounted) setAllEvents(eventRows);

        // 2. Get USER bookings 
        const bookingsSnap = await getDocs(
          collection(db, "users", uid, "bookings")
        );

        const bookingRows: Booking[] = bookingsSnap.docs.map(
          (docSnap: FirebaseFirestoreTypes.QueryDocumentSnapshot) => {
            const data = docSnap.data() as Omit<Booking, "id">;

            return {
              id: docSnap.id,
              ...data,
            };
          }
        );

        if (mounted) setBookings(bookingRows);
      } catch (e: any) {
        Alert.alert("Error", "Failed to load your bookings.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();
    return () => {
      mounted = false;
    };
  }, []);

  //  match bookings to events 
  const bookedEvents = useMemo(() => {
    return bookings
      .map((b) => {
        const event = allEvents.find((e) => e.id === b.eventId);

        if (!event) return null;

        return {
          ...b,
          event,
        };
      })
      .filter(Boolean);
  }, [bookings, allEvents]);

  return (
    <BookedEventsUI
      events={bookedEvents as any}
      loading={loading}
      onBack={() => router.back()}
      onPressCard={(item: any) =>
        router.push({
          pathname: "/event/event-details",
          params: { id: item.eventId },
          } as any)
      }
    />
  );
}