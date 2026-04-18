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

export const BookedEventsUI = ({
  events,
  loading,
  onBack,
  onPressCard,
 
  
}: BookedEventsUIProps) => {
  const renderItem = ({ item }: { item: Booking }) => (
     <View>
     <EventCard
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
/>

    <View style={styles.ticketInfo}>
      <Text style={styles.infoText}>
        Tickets booked: {item.ticketCount}
      </Text>

      <Text style={styles.infoText}>
        Total paid: ${item.totalPaid}
      </Text>

       <Text style={styles.infoText}>
        Status: {item.status}
       </Text>

        <Text style={styles.infoText}>
           Booked on:{" "}
          {item.createdAt?.toDate?.()?.toLocaleDateString?.() ||
           "N/A"}
        </Text>
      </View>
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
  ticketInfo: {
  marginTop: 10,
  paddingHorizontal: 10,
},
infoText: {
  fontSize: 13,
  color: "#555",
  marginTop: 2,
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
