import { useLocalSearchParams, useRouter } from "expo-router";
// Path: @/ alias points to src/
import { BookingConfirmedUI } from "@/screens/event/confirmation-UI";

export default function BookingConfirmedRoute() {
  const router = useRouter();
  // Stores the navigation parameters passed from the booking screen in the params var.
  const params = useLocalSearchParams();

  // Stores the organized booking data in the bookingDetails var.
  // Uses the '||' instruction to show default text if a value is missing.
  const bookingDetails = {
    title: (params.title as string) || "Event title",
    time: (params.time as string) || "Time TBD",
    location: (params.location as string) || "Location TBD",
    bookingId: (params.bookingId as string) || "N/A",
   totalCost:
  (params.totalCost as string) ||
  (params.totalPrice as string) ||
  (params.price
    ? `$${Number(params.price).toFixed(2)}`
    : "$0.00"),
    image: (params.image as string) || "",
    ticketCount: (params.ticketCount as string) || "1",
    ticketType: (params.ticketType as string) || "Free Event",
    eventId: (params.eventId as string) || "",
    type: (params.type as string) || "event",
  };

  return (
    // Passes the bookingDetails values and navigation instructions to the confirmation-screen.
    <BookingConfirmedUI
      details={bookingDetails}
      // !!Need to add a booking sub screen for profile!!
      onGoToBookings={() => router.replace("/profile" as any)}
      // Navigates to the event details screen using the eventId
      // from the bookingDetails.
      onViewDetails={() =>
        router.push({
          pathname: "/event/event-details",
          params: { id: bookingDetails.eventId },
        } as any)
      }
    />
  );
}
