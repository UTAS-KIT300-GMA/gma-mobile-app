import { EventDoc } from "@/src/app/(tabs)/type";
import { collection, getDocs, query } from "@react-native-firebase/firestore";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppHeader } from "../../components/AppHeader";
import { EventCard } from "../../components/EventCard";
import { db } from "../../services/firebase";

export default function HomeScreen() {
  const [events, setEvents] = useState<EventDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const snap = await getDocs(query(collection(db, "events")));
        const rows: EventDoc[] = snap.docs.map(
          (d: { id: any; data: () => any }) => ({
            id: d.id,
            ...(d.data() as any),
          }),
        );
        if (mounted) setEvents(rows);
      } catch (e: any) {
        Alert.alert(
          "Failed to load events",
          e?.message ?? "Something went wrong",
        );
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader title="GMA Connect" />
      <View style={styles.container}>
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator />
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
                  });
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
