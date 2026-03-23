import React, { useEffect, useState } from "react";
import { Alert, ActivityIndicator, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { doc, getDoc, collection, addDoc, serverTimestamp } from "@react-native-firebase/firestore";
import { auth, db } from "@/services/authService";
import { BookingScreenUI } from "@/screens/event/booking-screen";

export default function BookingRoute() {
  const router = useRouter();
  // Stores the  event ID passed from the previous screen in the eventId var.
  const { eventId } = useLocalSearchParams(); 
  
  // Stores the event data, loading status, and ticket count to the following vars.
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [tickets, setTickets] = useState(1);

  useEffect(() => {
    async function loadEvent() {
      if (!eventId) return;
      try {

        // Fetches the event document from the 'events' collection.
        const snap = await getDoc(doc(db, "events", eventId as string));
        if (snap.exists()) {
          const data = snap.data();
          // Merges the document ID with the data with setEvent funtion and stores it in the event var.
          setEvent({ id: snap.id, ...data, price: data?.price || 0 }); 
        }
      } catch (error) {
        Alert.alert("Error", "Could not load event details.");
      } finally {
        setLoading(false);
      }
    }
    loadEvent();
  }, [eventId]);
  
  // Multiplies the ticket count var by the price var  and stores the result in totalPrice var.
  const totalPrice = event ? tickets * event.price : 0;
  
  // Stores function instructions in the handleConfirmBooking var.
  const handleConfirmBooking = async () => {
    const user = auth.currentUser;
    if (!user) return Alert.alert("Error", "You must be logged in.");
    
    // setProcess function changes the processing var to true to disable buttons during the save.
    setProcessing(true);
    try {
      
      // Defines the path to the user's private 'bookings' sub-collection.
      const userBookingsRef = collection(db, "users", user.uid, "bookings");
      
      // Adds a new document to the sub-collection and stores the result in docRef var.
      const docRef = await addDoc(userBookingsRef, {
        eventId: event.id,
        eventTitle: event.title,
        ticketCount: tickets,
        totalPaid: totalPrice,
        status: "confirmed",
        createdAt: serverTimestamp(),
      });

      // Uses the router tool to replace the screen with the confirmation screen.
      // Passes the booking details as params to the next screen.
      router.replace({
        pathname: "/event/confirmation",
        params: {
          bookingId: docRef.id,
          title: event.title,
          time: event.dateTime || "Time TBD",
          location: event.location || "Location TBD",
          totalPrice: `$${totalPrice.toFixed(2)}`,
          eventId: event.id
        }
      } as any);

    } catch (error) {
      console.error("Booking Error:", error);
      Alert.alert("Booking Failed", "Please try again.");
    } finally {
      setProcessing(false);
    }
  };
  // Shows a spinner if the loading store is true or the event store is empty.
  if (loading || !event) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" color="#9D246E"/>
      </View>
    );
  }

  return (
     // Passes the values of the var's and the function instructions to the booking-screen.
    <BookingScreenUI 
      event={event} 
      loading={loading}
      processing={processing}
      tickets={tickets}
      totalPrice={totalPrice}
      onBack={() => router.back()} 
      onIncreaseTickets={() => setTickets(t => t + 1)}
      onDecreaseTickets={() => setTickets(t => (t > 1 ? t - 1 : 1))}
      onConfirm={handleConfirmBooking}
    />
  );
}