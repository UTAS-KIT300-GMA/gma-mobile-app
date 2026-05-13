import React, { useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";
import {
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
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
  const [cancellingBookingId, setCancellingBookingId] = useState<string | null>(
    null,
  );

  function isBookingCancelled(status: string | undefined): boolean {
    const s = (status ?? "").toLowerCase();
    return s === "cancelled" || s === "canceled";
  }

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

  /**
   * @summary Marks a booking as cancelled in Firestore and updates local state.
   */
  const handleCancelBooking = async (booking: Booking) => {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      Alert.alert("Error", "You must be logged in.");
      return;
    }
    setCancellingBookingId(booking.id);
    try {
      await updateDoc(doc(db, "users", uid, "bookings", booking.id), {
        status: "cancelled",
      });
      setBookings((prev) =>
        prev.map((b) =>
          b.id === booking.id ? { ...b, status: "cancelled" } : b,
        ),
      );
    } catch {
      Alert.alert("Error", "Could not cancel this booking. Please try again.");
    } finally {
      setCancellingBookingId(null);
    }
  };

  //  match bookings to events
  const bookedEvents = useMemo(() => {
    return bookings
      .filter((b) => !isBookingCancelled(b.status))
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
      cancellingBookingId={cancellingBookingId}
      onCancelBooking={handleCancelBooking}
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