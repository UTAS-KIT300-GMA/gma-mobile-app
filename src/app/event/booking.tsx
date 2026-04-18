import { formatDateTime } from "@/components/utils";
import { BookingScreenUI } from "@/screens/event/booking-UI";
import { auth, db } from "@/services/authService";
import { colors } from "@/theme/ThemeProvider";
import { addDoc, collection, doc, getDoc, serverTimestamp } from "@react-native-firebase/firestore";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, View } from "react-native";

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

          // Derives the access type from ticket prices rather than trusting a stored type.
          const memberPrice = data?.ticketPrices?.member ?? 0;
          const nonMemberPrice = data?.ticketPrices?.nonMember ?? 0;
          const derivedType =
            memberPrice === 0 && nonMemberPrice === 0 ? "free" : "paid";

          // Merges the document ID with the data with setEvent funtion and stores it in the event var.
          // Stores the merged document ID and event data.
          setEvent({
            id: snap.id,
            ...data,
            type: derivedType,
          });
        } else {
          Alert.alert("Error", "Event not found.");
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
  // Gets ticket prices safely from the event.
  const memberPrice = event?.ticketPrices?.member ?? 0;
  const nonMemberPrice = event?.ticketPrices?.nonMember ?? 0;

  // Determines whether the event is free.
  const isFreeEvent = memberPrice === 0 && nonMemberPrice === 0;

  // Calculates the total price from ticket count and price per ticket.
  const totalPrice = tickets * (isFreeEvent ? 0 : memberPrice);

  // For now, booking only supports free events for free-tier users.
  // This keeps pricing future-proof for later subscription logic.

  // Stores function instructions in the handleConfirmBooking var.
  const handleConfirmBooking = async () => {
    const user = auth.currentUser;

    if (!user) {
      return Alert.alert("Error", "You must be logged in.");
    }

    if (!event?.id) {
      return Alert.alert("Error", "Event booking is not available.");
    }

    // Blocks paid/subscriber-only events for now.
    if (!isFreeEvent) {
  return Alert.alert(
        "Subscribers Only",
        "This event is available to subscribed members only.",
      );
    }

    // Disables button actions during save.
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
        
        event: {
          title: event.title,
          image: event.image,
          dateTime: event.dateTime,
          address: event.address,
        },
    });

      // Uses the router tool to replace the screen with the confirmation screen.
      // Passes the booking details as params to the next screen.
      router.replace({
        pathname: "/event/confirmation",
        params: {
          bookingId: docRef.id,
          title: event.title,
          time: event.dateTime ? formatDateTime(event.dateTime) : "Time TBD",
          location: event.address || "Location TBD",
          totalPrice: isFreeEvent ? "Free" : `$${totalPrice.toFixed(2)}`,
          eventId: event.id,
          image: event.image || "",
          ticketCount: String(tickets),
          ticketType: isFreeEvent ? "Free Event" : "Subscribers Only",
        },
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
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={colors.primary} />
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
      onIncreaseTickets={() => setTickets((t) => t + 1)}
      onDecreaseTickets={() => setTickets((t) => (t > 1 ? t - 1 : 1))}
      onConfirm={handleConfirmBooking}
    />
  );

  
}
