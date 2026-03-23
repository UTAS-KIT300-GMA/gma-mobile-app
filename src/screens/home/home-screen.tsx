import { router } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { EventDoc } from "@/types/type";
import { AppHeader } from "@/components/AppHeader";
import { EventCard } from "@/components/EventCard";

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
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color="#a64d79" size="large" />
          </View>
        ) : (
          <FlatList
            data={events}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <EventCard
                event={item}
                onPressRsvp={() => Alert.alert("RSVP", "To be implemented")}
                onPressCard={() => {
                  router.push({
                    pathname: "/event-details",
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
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#ffffff" },
  container: { flex: 1, backgroundColor: "#ffffff" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  listContent: { padding: 10, paddingBottom: 24 },
});