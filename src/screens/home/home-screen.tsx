import { AppHeader } from "@/components/AppHeader";
import { EventCard } from "@/components/EventCard";
import { colors } from "@/theme/ThemeProvider";
import { EventDoc } from "@/types/type";
import { router } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type HomeUIProps = {
  events: EventDoc[];
  loading: boolean;
};

export default function HomeUI({ events, loading }: HomeUIProps) {
  // Navigation Handlers
  const handleProfilePress = () => {
    console.log("Navigating to Profile...");
    router.push("/(profile)" as any);
  };

  const handleNotificationPress = () => {
    router.push("/notifications" as any);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader
        title="GMA Connect"
        onPressProfile={handleProfilePress}
        onPressNotifications={handleNotificationPress}
      />

      <View style={styles.container}>
        <Text style={styles.sectionTitle}>For You</Text>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color={colors.primary} size="large" />
          </View>
        ) : (
          <FlatList
            data={events}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <EventCard
                event={item}
                // Defines the onPressRsvp handler to navigate to the booking screen with the event ID as a parameter.
                onPressRsvp={() => {
                  router.push({
                    pathname: "/event/booking",
                    params: {
                      eventId: item.id,
                    },
                  } as any);
                }}
                // Defines the onPressCard handler to navigate to the event details screen with all necessary event data as parameters.
                onPressCard={() => {
                  router.push({
                    pathname: "/event/event-details",
                    params: {
                      id: item.id,
                      title: item.title,
                      description: item.description,
                      image: item.image,
                      dateTime:
                        typeof item.dateTime?.toDate === "function"
                          ? item.dateTime.toDate().toString()
                          : (item.dateTime?.toString?.() ?? ""),
                      type: item.type,
                      totalTickets: item.totalTickets,
                      address: item.address,
                      memberPrice: item.ticketPrices?.member,
                      nonMemberPrice: item.ticketPrices?.nonMember,
                    },
                  } as any);
                }}
              />
            )}
          />
        )}

        <Text style={styles.sectionTitle}>Featured</Text>
        <Text style={styles.sectionTitle}>You might be interested in...</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.textOnPrimary },
  container: { flex: 1, backgroundColor: colors.textOnPrimary },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  sectionTitle: {
    paddingHorizontal: 20,
    paddingTop: 10,
    fontSize: 18,
    fontWeight: "bold",
    color: colors.saveBtnTextColor,
  },
  listContent: { padding: 10, paddingBottom: 24 },
});
