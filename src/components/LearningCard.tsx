import { LearningDoc } from "@/types/type";
import { Cloudinary } from "@cloudinary/url-gen";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "@/theme/ThemeProvider";
import { thumbnail } from "@cloudinary/url-gen/actions/resize";
import { autoGravity } from "@cloudinary/url-gen/qualifiers/gravity";

const cld = new Cloudinary({
  cloud: {
    cloudName: process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME,
  },
});

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
 * @summary A presentational card component that displays video metadata, handles thumbnail optimization via Cloudinary, and provides interaction hooks for playback and bookmarking.
 * @param item - The LearningDoc object containing title, description, duration, and metadata.
 * @param onPressCard - Callback function triggered when the user taps the card body to view content.
 * @param onBookmarkPress - Callback function triggered when the user taps the bookmark icon.
 */
export default function LearningCard({ 
  item, 
  onPressCard, 
  onBookmarkPress 
}: LearningCardProps) {

  /**
 * @summary Generates an optimized image URL using Cloudinary transformations (AI-based gravity, auto-quality, and resizing) or returns a fallback placeholder.
 * @param item.cloudinaryPublicId - Dependency: Recalculates if the Cloudinary ID changes to fetch the correct asset.
 * @param item.thumbnailUrl - Dependency: Recalculates if the static fallback URL is updated.
 */
  const optimizedThumbnail = useMemo(() => {
    if (item.cloudinaryPublicId) {
      return cld.image(item.cloudinaryPublicId)
        .setAssetType("video")
        .resize(
          thumbnail()
            .width(800)
            .gravity(autoGravity()) // Uses AI to find the best frame
        )
        .format("jpg")
        .quality("auto")
        .toURL();
    }
    return item.thumbnailUrl || "https://via.placeholder.com/800x450.png?text=No+Thumbnail";
  }, [item.cloudinaryPublicId, item.thumbnailUrl]);

  return (
    <Pressable style={styles.card} onPress={onPressCard}>
      {/* Visual Header */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: optimizedThumbnail }}
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