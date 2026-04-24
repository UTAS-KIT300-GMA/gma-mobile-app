import { AppHeader } from "@/components/AppHeader";
import { EventCard } from "@/components/EventCard";
import { colors } from "@/theme/ThemeProvider";
import { Booking } from "@/types/type";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface BookedEventsUIProps {
  events: Booking[];
  loading: boolean;
  onBack: () => void;
  onPressCard: (event: Booking) => void;
}

/**
 * @summary Renders the user's booked events list with ticket/payment metadata.
 * @param events - Booking records to display.
 * @param loading - Loading state for bookings fetch.
 * @param onBack - Back navigation callback.
 * @param onPressCard - Event-card press callback.
 * @throws {never} UI delegates side effects to callback props.
 * @Returns {React.JSX.Element} Booked-events screen UI.
 */
export const BookedEventsUI = ({
  events,
  loading,
  onBack,
  onPressCard,
 
  
}: BookedEventsUIProps) => {
  /**
   * @summary Renders a booking row with event card and booking metadata.
   * @param item - Booking record for one rendered row.
   * @throws {never} Pure render helper does not throw.
   * @Returns {React.JSX.Element} Booking row element.
   */
  const renderItem = ({ item }: { item: Booking }) => (
    <View>
      <EventCard
        key={item.id}
        event={{
          id: item.eventId,
          title: item.event.title,
          image: item.event.image,
          dateTime: item.event.dateTime,
          address: item.event.address,
          category: "all",
          description: "",
          location: {} as any,
          type: "free",
          totalTickets: 0,
          memberPrice: 0,
          nonMemberPrice: 0,
        }}
        onPressCard={() => onPressCard(item)}
        showRsvpButton={false}
        footerContent={
          <View style={styles.ticketInfoContent}>
            <View style={styles.ticketInfoRow}>
              <Text style={styles.infoLabel}>Tickets booked</Text>
              <Text style={styles.infoValue}>{item.ticketCount}</Text>
            </View>
            <View style={styles.ticketInfoRow}>
              <Text style={styles.infoLabel}>Total paid</Text>
              <Text style={styles.infoValue}>${item.totalPaid}</Text>
            </View>
            <View style={styles.ticketInfoRow}>
              <Text style={styles.infoLabel}>Status</Text>
              <Text style={styles.infoValue}>{item.status}</Text>
            </View>
            <View style={styles.ticketInfoRow}>
              <Text style={styles.infoLabel}>Booked on</Text>
              <Text style={styles.infoValue}>
                {item.createdAt?.toDate?.()?.toLocaleDateString?.() || "N/A"}
              </Text>
            </View>
          </View>
        }
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <AppHeader title="Booked Events" showBack={true} />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={events}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listPadding}
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons
                name="book-outline"
                size={60}
                color={colors.textOnPrimary}
              />
              <Text style={styles.emptyText}>No booked events yet!</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.textOnPrimary },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 100,
  },
  ticketInfoContent: {
    gap: 2,
  },
  ticketInfoRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingVertical: 3,
  },
  infoLabel: {
    fontSize: 13,
    color: "#555",
    minWidth: 100,
  },
  infoValue: {
    fontSize: 13,
    color: colors.saveBtnTextColor,
    fontWeight: "700",
    textTransform: "capitalize",
    marginLeft: 8,
  },

  listPadding: { padding: 16 },
  rsvpBtn: {
    backgroundColor: colors.saveBtnColor,
    padding: 10,
    borderRadius: 8,
  },
  rsvpText: { fontWeight: "bold", fontSize: 12 },
  emptyText: { marginTop: 10, color: colors.darkGrey, fontSize: 16 },
});
