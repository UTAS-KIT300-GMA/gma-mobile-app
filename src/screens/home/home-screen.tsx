import React, { useMemo } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextStyle,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

import { AppHeader } from "@/components/AppHeader";
import { EventCard } from "@/components/EventCard";
import { colors } from "@/theme/ThemeProvider";
import { useAuthUser, useAppLocation } from "@/context/GlobalContext";
import { calculateHaversineDistance } from "@/components/utils";
import { EventDoc } from "@/types/type.ts";

export type RecommendedEvent = EventDoc & {
  finalScore: number;
  dist: number;
  matchCount: number;
};

type HomeUIProps = {
  events: EventDoc[];
  loading: boolean;
  onRefresh: () => void;
};

const MATCH_PERCENTAGE = [0.6, 0.25, 0.15]; // Tags , Location, Time

/**
 * @summary Renders home feed sections (featured, for-you, random) from scored events.
 * @param events - Approved events list from context.
 * @param loading - Loading state for refresh and initial data.
 * @param onRefresh - Pull-to-refresh callback.
 * @throws {never} UI delegates route actions and refresh handling externally.
 * @Returns {React.JSX.Element} Home feed screen.
 */
export default function HomeUI({ events, loading, onRefresh }: HomeUIProps) {
  const { userDoc } = useAuthUser();
  const { coords: userCoords, locationError } = useAppLocation();

  const { featuredEvents, forYouEvents, randomEvents } = useMemo(() => {
    if (!events || events.length === 0) {
      return { featuredEvents: [], forYouEvents: [], randomEvents: [] };
    }

    const today = Date.now();
    const userTagsArray = userDoc?.selectedTags ?? [];

    // Fix: Ensure Set is explicitly typed to string to match event tags
    const userTagsSet = new Set<string>(userTagsArray);

    // 1. FEATURED (Advertisements)
    const featured = events
      .filter((e) => e.isAd === true)
      .sort((a, b) => {
        const timeA = a.dateTime?.toDate?.()?.getTime() || 0;
        const timeB = b.dateTime?.toDate?.()?.getTime() || 0;
        return timeA - timeB;
      })
      .slice(0, 10);

    // 2. FOR YOU (Weighted Scoring)
    const scored: RecommendedEvent[] = events
      .filter((e) => !featured.find((f) => f.id === e.id))
      .map((event) => {
        // Tag Match (60%)
        const tags = event.interestTags || [];
        const matchCount = tags.filter((t): t is string =>
          userTagsSet.has(t),
        ).length;

        const tagScore =
          userTagsArray.length > 0 ? matchCount / userTagsArray.length : 0;

        // Location Match (25%) - Max 20km
        const dist =
          userCoords && event.location
            ? calculateHaversineDistance(
                userCoords.latitude,
                userCoords.longitude,
                event.location.latitude,
                event.location.longitude,
              )
            : 20;
        const locScore = dist <= 20 ? 1 - dist / 20 : 0;

        // Time Match (15%) - Urgency
        const eventTime = event.dateTime?.toDate?.()?.getTime() || 0;
        const daysUntil = (eventTime - today) / (1000 * 60 * 60 * 24);
        const timeScore = daysUntil >= 0 ? 1 / (1 + daysUntil) : 0;

        const finalScore =
          tagScore * MATCH_PERCENTAGE[0] +
          locScore * MATCH_PERCENTAGE[1] +
          timeScore * MATCH_PERCENTAGE[2];

        return { ...event, finalScore, dist, matchCount };
      })
      .sort((a, b) => (b.finalScore || 0) - (a.finalScore || 0));

    const forYou = scored.slice(0, 10);

    // 3. YOU MIGHT BE INTERESTED IN (Diversity)
    let randomCandidates = scored.filter(
      (s) => !forYou.find((f) => f.id === s.id),
    );

    if (userTagsArray.length < 25) {
      randomCandidates = randomCandidates.sort(
        (a, b) => (a.matchCount || 0) - (b.matchCount || 0),
      );
    }

    const random = randomCandidates
      .sort(() => 0.5 - Math.random())
      .slice(0, 10);

    return {
      featuredEvents: featured,
      forYouEvents: forYou,
      randomEvents: random,
    };
  }, [events, userCoords, userDoc?.selectedTags]);

  const handlePressRsvp = async (item: EventDoc) => {
      router.push({
          pathname: "/event/booking",
          params: { eventId: item.id },
      } as any)
  }

  const handlePressCard = async (item: EventDoc) => {
      router.push({
          pathname: "/event/event-details",
          params: { id: item.id },
      } as any)
  }

  /**
   * @summary Renders a horizontal event section with title and cards.
   * @param title - Section heading text.
   * @param data - Events to display in the horizontal list.
   * @throws {never} Pure render helper does not throw.
   * @Returns {React.JSX.Element} Horizontal section block.
   */
  const renderHorizontalSection = (title: string, data: EventDoc[]) => (
    <View style={styles.horizontalSection}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <FlatList
        horizontal
        data={data}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => `horiz-${item.id}`}
        contentContainerStyle={styles.horizontalListContent}
        renderItem={({ item }) => (
          <View style={styles.featuredCardWrapper}>
            <EventCard
              key={`random-${item.id}`}
              event={item}
              onPressRsvp={() => handlePressRsvp(item)}
              onPressCard={() => handlePressCard(item)}
            />
          </View>
        )}
      />
    </View>
  );

  if (loading && events.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <AppHeader title="GMA Connect" />
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader title="GMA Connect" showBack={false} />

      <FlatList
        data={forYouEvents}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshing={loading}
        onRefresh={onRefresh}
        ListHeaderComponent={
          <>
            {locationError && (
              <Text style={styles.locationError}>{locationError}</Text>
            )}

            {/* Only show Featured section if data exists */}
            {featuredEvents.length > 0 &&
              renderHorizontalSection("🔥 Featured", featuredEvents)}

            {/* Only show "For You" title if there are events to display under it */}
            {forYouEvents.length > 0 && (
              <Text style={styles.sectionTitle}>✨ For You</Text>
            )}
          </>
        }
        renderItem={({ item }) => (
          <View style={styles.verticalCardWrapper}>
            <EventCard
              key={`random-${item.id}`}
              event={item}
              onPressRsvp={() => handlePressRsvp(item)}
              onPressCard={() => handlePressCard(item)}
            />
          </View>
        )}
        ListFooterComponent={
          randomEvents.length > 0 ? (
            <View style={styles.footerSection}>
              <Text style={styles.sectionTitle}>
                🎲 You might be interested in...
              </Text>
              {randomEvents.map((item, index) => (
                <View
                  key={`random-wrapper-${item.id ?? index}`}
                  style={styles.verticalCardWrapper}
                >
                  <EventCard
                    key={`random-${item.id}`}
                    event={item}
                    onPressRsvp={() => handlePressRsvp(item)}
                    onPressCard={() => handlePressCard(item)}
                  />
                </View>
              ))}
              <View style={{ height: 40 }} />
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyText}>
              No events found for your interests.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.textOnPrimary, marginBottom: -50 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: colors.darkGrey,
    textAlign: "center",
    fontWeight: "500",
  } as TextStyle,
  sectionTitle: {
    paddingHorizontal: 5,
    paddingBottom: 10,
    fontSize: 20,
    fontWeight: "bold",
    color: colors.primary,
  } as TextStyle,
  locationError: {
    fontSize: 12,
    color: "red",
    textAlign: "center",
    marginVertical: 5,
  } as TextStyle,
  listContent: { paddingBottom: 12 },
  verticalCardWrapper: { paddingHorizontal: 18 }, // "For You" & "You might be interested in" sections
  horizontalSection: { marginVertical: 10 }, // "Featured" section
  horizontalListContent: { paddingLeft: 5, paddingRight: 10 },
  featuredCardWrapper: { width: 320, marginRight: -10 }, 
  footerSection: { marginTop: 20 },
});
