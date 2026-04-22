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
import React, { useMemo } from "react";
import { useAuthUser, useAppLocation } from "@/context/GlobalContext";
import { calculateHaversineDistance, getParentCategoryFromTagName } from "@/components/utils";

type HomeUIProps = {
  events: EventDoc[];
  loading: boolean;
  onRefresh: () => void;
};

export default function HomeUI({ events, loading, onRefresh }: HomeUIProps) {
  const { userDoc } = useAuthUser();
  const { coords: userCoords, locationError } = useAppLocation();

  // Process events: interests → distance → time
  const processedEvents = useMemo(() => {
    if (!events || events.length === 0) return [];

    // 1. Prepare Interests
    const weights: Record<string, number> = { connect: 0, grow: 0, thrive: 0 };
    const tags = userDoc?.selectedTags ?? [];

    tags.forEach((tag) => {
      const parent = getParentCategoryFromTagName(tag);
      if (parent && parent in weights) weights[parent]++;
    });

    // Sort categories by count to create weights (3, 2, 1)
    const sortedPreferences = Object.entries(weights).sort(([, a], [, b]) => b - a);
    const interestMap: Record<string, number> = {};
    sortedPreferences.forEach(([cat], index) => {
      interestMap[cat] = sortedPreferences.length - index;
    });

    console.log("sortedPreferences", sortedPreferences);

    // 2. Sort a copy of the list
    // We use OR (||) to chain priorities: Interests -> Distance -> Time
    return [...events].sort((a, b) => {
      // Priority 1: Category Interests
      const wA = interestMap[a.category] || 0;
      const wB = interestMap[b.category] || 0;
      if (wA !== wB) return wB - wA;

      // Priority 2: Distance
      const distA = (userCoords && a.location)
          ? calculateHaversineDistance(userCoords.latitude, userCoords.longitude, a.location.latitude, a.location.longitude)
          : Infinity;
      const distB = (userCoords && b.location)
          ? calculateHaversineDistance(userCoords.latitude, userCoords.longitude, b.location.latitude, b.location.longitude)
          : Infinity;
      if (distA !== distB) return distA - distB;

      // Priority 3: Time
      const timeA = (a.dateTime as any)?.toDate?.()?.getTime() || 0;
      const timeB = (b.dateTime as any)?.toDate?.()?.getTime() || 0;
      return timeA - timeB;
    });

  }, [
    events,
    userCoords,
    userDoc?.selectedTags
  ]);

  return (
      <SafeAreaView style={styles.safe}>
        <AppHeader
            title="GMA Connect"
            onPressProfile={() => router.push("/(profile)" as any)}
            onPressNotifications={() => router.push("/notifications" as any)}
        />

        <View style={styles.container}>
          <View style={styles.headerRow}>
            <Text style={styles.sectionTitle}>For You</Text>
            {locationError ? (
              <Text style={styles.locationError}>{locationError}</Text>
            ) : null}
          </View>

          {loading && events.length === 0 ? (
              <View style={styles.center}>
                <ActivityIndicator color={colors.primary} size="large" />
              </View>
          ) : (
              <FlatList
                  data={processedEvents}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={styles.listContent}
                  refreshing={loading}
                  onRefresh={onRefresh}
                  ListEmptyComponent={
                    <View style={styles.center}>
                      <Text style={styles.emptyText}>No events found nearby.</Text>
                    </View>
                  }
                  renderItem={({ item }) => (
                      <EventCard
                          event={item}
                          onPressRsvp={() => router.push({ pathname: "/event/booking", params: { eventId: item.id } } as any)}
                          onPressCard={() => router.push({ pathname: "/event/event-details", params: { id: item.id } } as any)}
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
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyText: {
    fontSize: 16,
    color: colors.darkGrey || "#666",
    textAlign: "center",
    lineHeight: 24,
    marginTop: 12,
    fontWeight: "500",
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 20
  },
  sectionTitle: {
    paddingHorizontal: 20,
    paddingTop: 10,
    fontSize: 18,
    fontWeight: "bold",
    color: colors.primary,
  },
  locationError: {
    fontSize: 12,
    color: 'red',
    paddingTop: 10
  },
  listContent: { padding: 10, paddingBottom: 24 },
});