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
import * as Location from 'expo-location';
import React, { useState, useEffect, useMemo } from "react";

type HomeUIProps = {
  events: EventDoc[];
  loading: boolean;
  onRefresh: () => void;
};

export default function HomeUI({ events, loading, onRefresh }: HomeUIProps) {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [userCoords, setUserCoords] = useState<{latitude: number, longitude: number} | null>(null);

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

  // useMemo prevents re-sorting on every render unless events or coords change
  const processedEvents = useMemo(() => {
    let list = [...events];

    if (userCoords) {
      return list.sort((a, b) => {
        if (!a.location || !b.location) return 0;

        const distA = calculateHaversineDistance(
            userCoords.latitude,
            userCoords.longitude,
            a.location.latitude,
            a.location.longitude
        );
        const distB = calculateHaversineDistance(
            userCoords.latitude,
            userCoords.longitude,
            b.location.latitude,
            b.location.longitude
        );

        return distA - distB;
      });
    }
    return list;
  }, [events, userCoords]);

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