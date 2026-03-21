import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
    ImageBackground,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { formatDateTime } from "@/components/utils"
import {AppHeader} from "@/components/AppHeader";

export default function EventDetailScreen() {
    const router = useRouter();
    const event = useLocalSearchParams() as any;

    const isFree = event.type?.toLowerCase() === "free";

    return (
        <SafeAreaView style={styles.safe}>
            <AppHeader title="Event Details" showBack/>
            {/*<View style={styles.header}>*/}

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <ImageBackground source={{ uri: event.image }} style={styles.image}>
                    <View style={styles.imageOverlay}>
                        <View style={styles.imageBottomLeft}>
                            <Text style={styles.imageTitle}>{event.title}</Text>
                            <Text style={styles.imageMeta} numberOfLines={1}>
                                {formatDateTime(event.dateTime)}
                            </Text>
                            <Text style={styles.imageMeta}>{event.address}</Text>
                        </View>

                        <Pressable style={styles.bookmarkBtn}>
                            <Ionicons name="bookmark-outline" size={24} color="#ffffff" />
                        </Pressable>
                    </View>
                </ImageBackground>

                <View style={styles.section}>
                    <Text style={styles.heading}>Description:</Text>
                    <Text style={styles.descriptionText}>
                        {event.description ?? "No description provided."}
                    </Text>
                </View>

                <View style={styles.infoRow}>
                    <Text style={styles.label}>Event Time: </Text>
                    <Text style={styles.value}>{formatDateTime(event.dateTime)}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Text style={styles.label}>Event Capacity: </Text>
                    <Text style={styles.value}>{event.totalTickets} people</Text>
                </View>

                <View style={styles.infoRow}>
                    <Text style={styles.label}>Event Type: </Text>
                    <Text style={styles.value}>{event.type}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Text style={styles.label}>Price: </Text>
                    <Text style={styles.value}>
                        {isFree
                            ? "Free"
                            : `$${event.memberPrice} (Member) / $${event.nonMemberPrice} (Non-member)`}
                    </Text>
                </View>

                <View style={styles.organizerSection}>
                    <Text style={styles.label}>Organized by</Text>
                    <View style={styles.logoPlaceholder}>
                        <Text style={styles.logoText}>GMA Connect</Text>
                    </View>
                </View>

                <Pressable style={styles.rsvpButton}>
                    <Text style={styles.rsvpButtonText}>RSVP/Book</Text>
                </Pressable>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: "#ffffff" },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        height: 56,
    },
    backBtn: { padding: 4 },
    headerTitle: { fontSize: 18, fontWeight: "700", color: "#1f2937" },
    scrollContent: { paddingBottom: 40 },
    image: {
        height: 250,
        width: "100%",
        justifyContent: "flex-end",
        backgroundColor: "#e5e7eb",
    },
    imageOverlay: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-end",
        padding: 20,
        backgroundColor: "rgba(0,0,0,0.3)",
    },
    imageBottomLeft: { flex: 1, gap: 4 },
    imageTitle: { color: "#fff", fontSize: 20, fontWeight: "800" },
    imageMeta: {
        color: "#ffffff",
        fontSize: 12,
        opacity: 0.95, },
    bookmarkBtn: {
        backgroundColor: "rgba(0,0,0,0.5)",
        padding: 10,
        borderRadius: 999,
    },
    section: { padding: 20 },
    heading: { fontSize: 18, fontWeight: "700", marginBottom: 8 },
    descriptionText: { fontSize: 15, color: "#4b5563", lineHeight: 22 },
    infoRow: {
        flexDirection: "row",
        paddingHorizontal: 20,
        marginBottom: 12,
    },
    label: { fontSize: 15, fontWeight: "700", color: "#1f2937" },
    value: { fontSize: 15, color: "#4b5563", flex: 1 },
    organizerSection: { padding: 20, alignItems: "flex-start", gap: 10 },
    logoPlaceholder: {
        width: 120,
        height: 40,
        backgroundColor: "#f3f4f6",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#d1d5db",
    },
    logoText: { fontSize: 12, fontWeight: "600", color: "#a64d79" },
    rsvpButton: {
        backgroundColor: "#a64d79",
        marginHorizontal: 20,
        marginTop: 20,
        height: 56,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
    },
    rsvpButtonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});