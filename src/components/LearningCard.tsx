import { LearningDoc } from "@/types/type";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "@/theme/ThemeProvider";

const PLACEHOLDER_THUMB =
  "https://via.placeholder.com/800x450.png?text=No+Thumbnail";

// Explicitly export props to satisfy IntrinsicAttributes in other files
export interface LearningCardProps {
  // Holds the learning item rendered by this card.
  item: LearningDoc;
  // Holds tap handler for opening/expanding the card.
  onPressCard?: () => void;
  // Holds tap handler for bookmark toggle action.
  onBookmarkPress?: () => void;
}

/**
 * @summary Presentational card for learning content (thumbnail from `thumbnailUrl`, Firebase or any HTTPS).
 * @param item - The LearningDoc object containing title, description, duration, and metadata.
 * @param onPressCard - Callback when the user taps the card body to view content.
 * @param onBookmarkPress - Callback when the user taps the bookmark icon.
 */
export default function LearningCard({
  item,
  onPressCard,
  onBookmarkPress,
}: LearningCardProps) {
  const thumbnailUri = useMemo(() => {
    const u = item.thumbnailUrl?.trim();
    if (u) return u;
    return PLACEHOLDER_THUMB;
  }, [item.thumbnailUrl]);

  return (
    <Pressable style={styles.card} onPress={onPressCard}>
      {/* Visual Header */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: thumbnailUri }}
          style={styles.thumbnail}
          resizeMode="cover"
        />
        <View style={styles.durationBadge}>
          <Text style={styles.durationText}>{item.duration}</Text>
        </View>
      </View>

      <Pressable
        onPress={onBookmarkPress}
        hitSlop={10}
        style={styles.bookmarkButton}
      >
        <Ionicons
          name={item.isBookmarked ? "bookmark" : "bookmark-outline"}
          size={22}
          color={item.isBookmarked ? colors.secondary : colors.secondary}
        />
      </Pressable>

      {/* Content Body */}
      <View style={styles.infoContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.title} numberOfLines={1}>
            {item.title}
          </Text>
        </View>

        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>

        {/* Membership Access Label */}
        {item.accessType === "paid" && (
          <View style={styles.subscriberBadge}>
            <Ionicons name="star" size={12} color={colors.saveBtnTextColor} />
            <Text style={styles.subscriberText}>SUBSCRIBER ONLY</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // Holds all style declarations for the reusable learning card component.
  card: {
    backgroundColor: "#fff",
    borderRadius: 15,
    marginBottom: 20,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  imageContainer: {
    height: 180,
    backgroundColor: "#eee",
    position: "relative",
  },
  thumbnail: { width: "100%", height: "100%" },

  bookmarkButton: {
    position: "absolute",
    right: 10,
    top: 10,
    width: 43,
    height: 39,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.textOnPrimary,
  },

  durationBadge: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.75)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  durationText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  infoContainer: { padding: 15 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1a1a1a",
    flex: 1,
    marginRight: 10,
  },
  description: { fontSize: 14, color: "#666", lineHeight: 20 },
  subscriberBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFD700",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 10,
  },
  subscriberText: {
    color: colors.saveBtnTextColor,
    fontSize: 10,
    fontWeight: "800",
    marginLeft: 4,
  },
});
