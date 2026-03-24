import { useRouter, useLocalSearchParams } from "expo-router";
// Path: @/ alias points to src/
import { BookingConfirmedUI } from "@/screens/event/confirmation-UI"

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
    totalCost: (params.totalPrice as string) || "$0.00",
  };

  return (
    // Passes the bookingDetails values and navigation instructions to the confirmation-screen.
    <BookingConfirmedUI 
      details={bookingDetails}
      
      // !!Need to add a booking sub screen for profile!!
      onGoToBookings={() => router.replace("/profile" as any)} 
      onViewDetails={() => router.back()}
    />
  );
}