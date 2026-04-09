import { AppHeader } from "@/components/AppHeader";
import { EventCard } from "@/components/EventCard";
import { colors } from "@/theme/ThemeProvider";
import { EVENT_CATEGORIES, EventDoc } from "@/types/type";
import { router } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Location from 'expo-location';
import React, { useState, useEffect, useMemo } from "react";
import {useAuthUser} from "@/context/UserContext.tsx";

type HomeUIProps = {
  events: EventDoc[];
  loading: boolean;
  onRefresh: () => void;
};

export default function HomeUI({ events, loading, onRefresh }: HomeUIProps) {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [userCoords, setUserCoords] = useState<{latitude: number, longitude: number} | null>(null);
  const { userDoc } = useAuthUser();

  /**
   * Calculates the distance between two points in kilometers
   */
  function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  }

  useEffect(() => {
    (async () => {
      try {
        // Check if the device-wide Location master switch is ON
        const enabled = await Location.hasServicesEnabledAsync();
        if (!enabled) {
          setErrorMsg('Please enable location services on your device.');
          return;
        }

        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Location permission denied.');
          return;
        }

        let loc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Highest,
          });

        setUserCoords({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude
        });
        setErrorMsg(null); // Clear any previous errors
      } catch (err) {
        console.error(err);
        setErrorMsg('Could not fetch location.');
      }
    })();
  }, []);

  const normalize = (v: string) => v.trim().toLowerCase();

  const getParentCategoryFromTagName = (
    tagName: string,
  ): EventDoc["category"] | null => {
    const needle = normalize(tagName);
    for (const group of EVENT_CATEGORIES) {
      if (group.items.some((item) => normalize(item.name) === needle)) {
        const name = normalize(group.category);
        if (name === "connect") return "connect";
        if (name === "grow") return "growth";
        if (name === "thrive") return "thrive";
        return null;
      }
    }
    return null;
  };

  // useMemo prevents re-sorting on every render unless events or coords change
  const processedEvents = useMemo(() => {
    let list = [...events];
    const selectedTags = userDoc?.selectedTags ?? [];

    // --- 1. RANK CATEGORIES BASED ON SELECTION COUNT ---
    const categoryCounts: Record<EventDoc["category"], number> = {
      all: 0,
      connect: 0,
      growth: 0,
      thrive: 0,
    };

    selectedTags.forEach((tagName) => {
      const parent = getParentCategoryFromTagName(tagName);
      if (parent) {
        categoryCounts[parent] += 1;
      }
    });

    // Create a weight map: highest count gets highest weight
    // Example: if Thrive has 5 tags and Connect has 2, Thrive = 2, Connect = 1, Growth = 0
    const sortedPreferences = Object.entries(categoryCounts)
        .filter(([cat]) => cat !== "all")
        .sort(([, countA], [, countB]) => (countB as number) - (countA as number));

    console.log("sortedPreferences", sortedPreferences);
    const weights: Record<string, number> = {};
    sortedPreferences.forEach(([cat], index) => {
      // Top category gets weight 3, second gets 2, third gets 1
      weights[cat] = sortedPreferences.length - index;
    });

    // --- 2. HELPER FUNCTIONS FOR SORTING ---
    const getCategoryWeight = (e: EventDoc) => {
      if (e.category === "all") return 0;
      return weights[e.category] || 0;
    };

    const getDistanceKm = (e: EventDoc) => {
      if (!userCoords || !e.location) return Number.POSITIVE_INFINITY;
      return calculateHaversineDistance(
          userCoords.latitude,
          userCoords.longitude,
          e.location.latitude,
          e.location.longitude
      );
    };

    // --- 3. FINAL SORTING ---
    return list.sort((a, b) => {
      // Priority 1: Category Ranking (Highest weighted category first)
      const weightA = getCategoryWeight(a);
      const weightB = getCategoryWeight(b);
      if (weightA !== weightB) return weightB - weightA;

      // Priority 2: Distance (Closer first)
      const distA = getDistanceKm(a);
      const distB = getDistanceKm(b);
      if (distA !== distB) return distA - distB;

      // Priority 3: Time (Soonest first)
      const dtA = (a.dateTime as any)?.toDate?.()?.getTime() || 0;
      const dtB = (b.dateTime as any)?.toDate?.()?.getTime() || 0;
      return dtA - dtB;
    });
  }, [events, userCoords, userDoc?.selectedTags]);

  // Navigation Handlers
  const handleProfilePress = () => router.push("/(profile)" as any);
  const handleNotificationPress = () => router.push("/notifications" as any);

  return (
      <SafeAreaView style={styles.safe}>
        <AppHeader
            title="GMA Connect"
            onPressProfile={handleProfilePress}
            onPressNotifications={handleNotificationPress}
        />

        <View style={styles.container}>
          <View style={styles.headerRow}>
            <Text style={styles.sectionTitle}>For You</Text>
            {errorMsg && <Text style={styles.locationError}>{errorMsg}</Text>}
          </View>

          {loading ? (
              <View style={styles.center}>
                <ActivityIndicator color={colors.primary} size="large" />
              </View>
          ) : (
              <FlatList
                  data={processedEvents}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={styles.listContent}

                  // This is where the magic happens:
                  refreshing={loading}
                  onRefresh={onRefresh}

                  // Optional: If the list is empty and still loading, show a spinner at the top
                  ListEmptyComponent={
                    loading ? (
                        <View style={styles.center}>
                          <ActivityIndicator color={colors.primary} size="large" />
                        </View>
                    ) : (
                        <View style={styles.center}>
                          <Text style={styles.emptyText}>No events found nearby.</Text>
                        </View>
                    )
                  }

                  renderItem={({ item }) => {
                    const distance = userCoords && item.location
                        ? calculateHaversineDistance(
                        userCoords.latitude,
                        userCoords.longitude,
                        item.location.latitude,
                        item.location.longitude
                    ).toFixed(1) + " km"
                        : "";

                    return (
                        <EventCard
                            event={item}
                            onPressRsvp={() => {
                              router.push({
                                pathname: "/event/booking",
                                params: { eventId: item.id },
                              } as any);
                            }}
                            onPressCard={() => {
                              router.push({
                                pathname: "/event/event-details",
                                params: {
                                  id: item.id,
                                  title: item.title,
                                  // ... other params
                                },
                              } as any);
                            }}
                        />
                    );
                  }}
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