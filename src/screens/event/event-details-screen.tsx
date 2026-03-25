import { AppHeader } from "@/components/AppHeader";
import { formatDateTime } from "@/components/utils";
import { colors } from "@/theme/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Props {
  event: any;
  loading: boolean;
  isBookmarked: boolean;
  onBookmark: () => void;
  onBack: () => void;
  onBook: () => void;
}

export default function EventDetailUI({
  event,
  loading,
  isBookmarked,
  onBookmark,
  onBack,
  onBook,
}: Props) {
  // If the loading var is true, show the spinner instruction instead of the screen.
  if (loading || !event) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Converts the event type to a user-friendly text for display.
  const getAccessText = () => {
    if (event.type === "free") {
      return "Free Event";
    }

    return "Subscribers Only";
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <AppHeader title="Event Details" showBack onPressBack={onBack} />

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <Image
          source={{ uri: event.image || "https://via.placeholder.com/400" }}
          style={styles.image}
        />

        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{event.title}</Text>
            <TouchableOpacity onPress={onBookmark}>
              <Ionicons
                name={isBookmarked ? "bookmark" : "bookmark-outline"}
                size={28}
                color={colors.secondary}
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.dateText}>
            <Ionicons name="calendar" size={16} />{" "}
            {event.dateTime ? formatDateTime(event.dateTime) : "Date TBD"}
          </Text>

          <Text style={styles.description}>
            {event.description || "No description provided."}
          </Text>

          <View style={styles.infoRow}>
            <Ionicons
              name="pricetag-outline"
              size={20}
              color={colors.saveBtnTextColor}
            />
            <Text style={styles.infoText}>{getAccessText()}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.bookButton} onPress={onBook}>
          <Text style={styles.bookButtonText}>RSVP / Book Now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.textOnPrimary },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  image: { width: "100%", height: 250 },

  content: {
    paddingHorizontal: 28,
    paddingTop: 20,
  },

  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    flex: 1,
    color: colors.saveBtnTextColor,
  },

  dateText: {
    fontSize: 16,
    color: colors.saveBtnTextColor,
    marginBottom: 20,
  },

  description: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.saveBtnTextColor,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
  },

  infoText: {
    marginLeft: 8,
    fontSize: 16,
    color: colors.saveBtnTextColor,
  },

  bottomBar: {
    position: "absolute",
    alignSelf: "center",
    bottom: 24,
    padding: 24,
    backgroundColor: colors.textOnPrimary,
    borderTopWidth: 1,
    borderColor: colors.textOnPrimary,
  },

  bookButton: {
    backgroundColor: colors.secondary,
    width: 265,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },

  bookButtonText: {
    color: colors.textOnPrimary,
    fontSize: 18,
    fontWeight: "bold",
  },
});
