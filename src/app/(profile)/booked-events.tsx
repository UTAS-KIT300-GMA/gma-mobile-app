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
import { bookedEventsUI } from "@/screens/profile/saved-events-UI";

/**
   * @summary Displays a user's booked events from Firestore and automactically updates the UI when an user deletes or adds a booking.
   * 
   * booking holds: eventID, eventTitle, eventDate and ticketCount.
   */
export default function BookedEventsRoute() {
  
  const router = useRouter();
  
  const [allEvents, setAllEvents] = useState<EventDoc[]>([]);                  // Stores an array of all the available bookings from the database.
  const [bookingIds, setBookingIds] = useState<Record<string, boolean>>({});  // Stores an object map of the event IDs the user has saved.
  const [loading, setLoading] = useState<boolean>(true);                     // Stores a boolean to track the background data fetching.

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

        // Fetch the Doc IDs of the events this specific user has bookings for and store in bookingsSnap var.
        const bookingsSnap = await getDocs(collection(db, "users", uid, "bookings"));
        const bookingsMap: Record<string, boolean> = {};
        
        bookingsSnap.forEach((docSnap: FirebaseFirestoreTypes.QueryDocumentSnapshot) => {
          const data = docSnap.data();
          bookingsMap[data.eventId] = true;
        });

        if (mounted) setBookingIds(bookingsMap);

      } catch (e: any) {
        Alert.alert("Error", "Failed to load your bookings.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();
    return () => { mounted = false; 
    };
  }, []);

  // Stores the resulting filtered array in the bookmarkedEvents var.
  const bookedEvents = useMemo(() => {
    return allEvents.filter(event => !!bookingIds[event.id]);
  }, [allEvents, bookingIds]);
  
  

  //not sure if needed will check later
  return (
    // Passes the values of bookmarkedEvents, loading, handleRemoveBoomark
    // and navigation instructions to the saved events screen.
    <BookedEventsUI
      events={bookedEvents}
      loading={loading}
      onBack={() => router.back()}
      onPressCard={(item) => router.push(`/event/${item.id}` as any)}
    />
  );
}