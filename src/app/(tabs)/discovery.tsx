import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  deleteDoc,
} from "@react-native-firebase/firestore";
import { AppHeader } from "@/components/AppHeader";
import { EventCard } from "@/components/EventCard";
import { auth, db } from "@/services/firebase";
import { EventDoc, Category } from "@/app/(tabs)/type";
import {router} from "expo-router";

const CATEGORY_OPTIONS: { key: Category; label: string }[] = [
  { key: "all", label: "All" },
  { key: "connect", label: "Connect" },
  { key: "growth", label: "Growth" },
  { key: "thrive", label: "Thrive" },
];

export default function DiscoveryScreen() {
  const [category, setCategory] = useState<Category>("all");
  const [events, setEvents] = useState<EventDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookmarkedIds, setBookmarkedIds] = useState<Record<string, boolean>>(
    {},
  );

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const snap = await getDocs(query(collection(db, "events")));
        const rows: EventDoc[] = snap.docs.map((d: { id: any; data: () => any; }) => ({
          id: d.id,
          ...(d.data() as any),
        }));
        if (mounted) setEvents(rows);
      } catch (e: any) {
        Alert.alert("Failed to load events", e?.message ?? "Something went wrong");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    if (category === "all") return events;
    return events.filter((e) => (e.category ?? "").toLowerCase() === category);
  }, [category, events]);

  const handleBookmark = async (event: EventDoc) => {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      Alert.alert("Not signed in", "Please log in again.");
      return;
    }

    const isBookmarked = !!bookmarkedIds[event.id];
    const bookmarkRef = doc(db, "users", uid, "bookmarks", event.id);

    try {
      if (isBookmarked) {
        await deleteDoc(bookmarkRef);

        setBookmarkedIds((prev) => {
          const next = { ...prev };
          delete next[event.id];
          return next;
        });
      } else {
        await setDoc(bookmarkRef, {
          eventId: event.id,
          title: event.title ?? "",
          savedAt: serverTimestamp(),
        });

        setBookmarkedIds((prev) => ({ ...prev, [event.id]: true }));
      }
    } catch (e: any) {
      Alert.alert("Action failed", e?.message ?? "Something went wrong");
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader title="GMA Connect" showNotiAndProfile/>

      <View style={styles.container}>
        <View style={styles.categoryRow}>
          {CATEGORY_OPTIONS.map((opt) => {
            const active = opt.key === category;
            return (
              <Pressable
                key={opt.key}
                onPress={() => setCategory(opt.key)}
                style={[styles.categoryPill, active && styles.categoryPillActive]}
              >
                <Text
                  style={[
                    styles.categoryText,
                    active && styles.categoryTextActive,
                  ]}
                >
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator />
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <EventCard
                event={item}
                showBookmark
                bookmarked={!!bookmarkedIds[item.id]}
                onPressBookmark={() => handleBookmark(item)}
                onPressRsvp={() => Alert.alert("RSVP", "To be implemented")}
                onPressCard={() => {
                  router.push({
                    pathname: "/event-details",
                    params: {
                      id: item.id,
                      title: item.title,
                      description: item.description,
                      image: item.image,
                      dateTime: item.dateTime?.toString(),
                      type: item.type,
                      totalTickets: item.totalTickets,
                      address: item.address,
                      memberPrice: item.ticketPrices?.member,
                      nonMemberPrice: item.ticketPrices?.nonMember
                    }
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
  categoryRow: {
    flexDirection: "row",
    padding: 10,
    justifyContent: "space-between",
    alignItems: "center",
  },
  categoryPill: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  categoryPillActive: {
    backgroundColor: "#a64d79",
    borderColor: "#a64d79",
  },
  categoryText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#374151",
  },
  categoryTextActive: {
    color: "#ffffff",
  },
});
