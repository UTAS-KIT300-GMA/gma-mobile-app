import { AppHeader } from "@/components/AppHeader";
import { EventCard } from "@/components/EventCard";
import { colors } from "@/theme/ThemeProvider";
import { EventDoc } from "@/types/type";
import { router } from "expo-router";
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text, TextStyle,
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

export type RecommendedEvent = EventDoc & {
    finalScore: number;
    dist: number;
    matchCount: number;
};

export default function HomeUI({ events, loading, onRefresh }: HomeUIProps) {
    const { userDoc } = useAuthUser();
    const { coords: userCoords, locationError } = useAppLocation();

    // Process events: interests → distance → time
    const { featuredEvents, forYouEvents, randomEvents } = useMemo(() => {
        if (!events || events.length === 0) {
            return { featuredEvents: [], forYouEvents: [], randomEvents: [] };
        }

        const today = Date.now();
        const userTagsArray = userDoc?.selectedTags ?? [];
        // Force the Set to accept generic strings to match Firestore data
        const userTagsSet = new Set<string>(userTagsArray);

        // 1. FEATURED (Advertisements)
        console.log("test", events
            .filter((e) => e.isAd === true))
        const featured = events
            .filter((e) => e.isAd === true)
            .sort((a, b) => {
                const timeA = a.dateTime?.toDate?.()?.getTime() || 0;
                const timeB = b.dateTime?.toDate?.()?.getTime() || 0;
                return timeA - timeB;
            })
            .slice(0, 10);
        console.log("featured events", featured);

        // 2. FOR YOU (Weighted Scoring)
        const scored: RecommendedEvent[] = events
            .filter((e) => !featured.find((f) => f.id === e.id))
            .map((event) => {
                // Tag Match (60%)
                const matchCount = event.interestTags?.filter((t) =>
                    userTagsSet.has(t)
                ).length || 0;
                const tagScore = userTagsArray.length > 0 ? matchCount / userTagsArray.length : 0;

                // Location Match (25%) - Max 20km
                const dist = (userCoords && event.location)
                    ? calculateHaversineDistance(
                        userCoords.latitude,
                        userCoords.longitude,
                        event.location.latitude,
                        event.location.longitude
                    )
                    : 20;
                const locScore = dist <= 20 ? 1 - dist / 20 : 0;

                // Time Match (15%) - Urgency
                const eventTime = event.dateTime?.toDate?.()?.getTime() || 0;
                const daysUntil = (eventTime - today) / (1000 * 60 * 60 * 24);
                const timeScore = daysUntil >= 0 ? 1 / (1 + daysUntil) : 0;

                const finalScore = tagScore * 0.6 + locScore * 0.25 + timeScore * 0.15;

                return { ...event, finalScore, dist, matchCount };
            })
            .sort((a, b) => (b.finalScore || 0) - (a.finalScore || 0));

        const forYou = scored.slice(0, 10);

        // 3. YOU MIGHT BE INTERESTED IN (Diversity)
        let randomCandidates = scored.filter((s) => !forYou.find((f) => f.id === s.id));

        if (userTagsArray.length < 25) {
            randomCandidates = randomCandidates.sort((a, b) => (a.matchCount || 0) - (b.matchCount || 0));
        }

        const random = randomCandidates
            .sort(() => 0.5 - Math.random())
            .slice(0, 10);

        return { featuredEvents: featured, forYouEvents: forYou, randomEvents: random };
    }, [events, userCoords, userDoc?.selectedTags]);

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
    center: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 50 },
    emptyText: {
        fontSize: 16,
        color: colors.darkGrey || "#666",
        textAlign: "center",
        fontWeight: "500",
    } as TextStyle,
    sectionTitle: {
        paddingHorizontal: 20,
        paddingTop: 15,
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
    listContent: { paddingBottom: 24 },
    horizontalSection: { marginVertical: 10 },
    horizontalListContent: { paddingLeft: 20, paddingRight: 10 },
    featuredCardWrapper: { width: 320, marginRight: -10 },
    footerSection: { marginTop: 20 },
});
