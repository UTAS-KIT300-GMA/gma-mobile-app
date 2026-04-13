import { AppHeader } from "@/components/AppHeader";
import { EventCard } from "@/components/EventCard";
import { colors } from "@/theme/ThemeProvider";
import { EventDoc } from "@/types/type";
import { router } from "expo-router";
import {
  ActivityIndicator, AppState,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Location from 'expo-location';
import React, {useState, useEffect, useMemo, useCallback, useRef} from "react";
import { useAuthUser } from "@/context/UserContext.tsx";
import { calculateHaversineDistance, getParentCategoryFromTagName } from "@/components/utils";

type HomeUIProps = {
  events: EventDoc[];
  loading: boolean;
  onRefresh: () => void;
};

const fetchLocationOnDemand = async () => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return { error: 'Permission denied.', coords: { latitude: -42.8821, longitude: 147.3272 } };

    const lastKnown = await Location.getLastKnownPositionAsync();
    if (lastKnown) return { error: null, coords: lastKnown.coords };

    const current = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    return { error: null, coords: current.coords };
  } catch (err) {
    // If it fails, check if services are actually enabled
    const enabled = await Location.hasServicesEnabledAsync();
    console.log("Are location services enabled?", enabled);

    return { error: !enabled ? 'Location services off' : null, coords: { latitude: -42.8821, longitude: 147.3272 } };
  }
};

export default function HomeUI({ events, loading, onRefresh }: HomeUIProps) {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [userCoords, setUserCoords] = useState<{ latitude: number, longitude: number }>({
    latitude: -42.8821,
    longitude: 147.3272,
  });
  const { userDoc } = useAuthUser();
  const lastFetchTime = useRef(0);
  console.log("userCoords", userCoords);

  // 1. Stable Location Updater
  const updateLocation = useCallback(async () => {
    const now = Date.now();
    // Throttle: Don't run more than once every 3 seconds to prevent loops
    if (now - lastFetchTime.current < 3000) return;
    lastFetchTime.current = now;

    const result = await fetchLocationOnDemand();

    if (result.coords) {
      setUserCoords((prev) => {
        // Strict primitive check to stop the render loop
        if (prev?.latitude === result.coords.latitude && prev?.longitude === result.coords.longitude) {
          return prev;
        }
        return { latitude: result.coords.latitude, longitude: result.coords.longitude };
      });
    }
    setErrorMsg(result.error);
  }, []);

  // 2. Lifecycle Management (Mount & AppState only)
  useEffect(() => {
    updateLocation();

    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") {
        updateLocation();
      }
    });

    return () => subscription.remove();
  }, [updateLocation]);

  // 3. Process Events (Optimized dependencies)
  const processedEvents = useMemo(() => {
    if (!events || events.length === 0) return [];

    // 1. Prepare Interests
    const weights: Record<string, number> = { connect: 0, growth: 0, thrive: 0 };
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
            {errorMsg && <Text style={styles.locationError}>{errorMsg}</Text>}
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