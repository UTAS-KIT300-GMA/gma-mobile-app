import React, { useMemo } from "react";
import { View, Text, StyleSheet, Pressable, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LearningVideo } from "@/types/type";
import { Cloudinary } from "@cloudinary/url-gen";

// CLOUDINARY ACTIONS: Using the modern Actions-based syntax
import { thumbnail } from "@cloudinary/url-gen/actions/resize";
import { autoGravity } from "@cloudinary/url-gen/qualifiers/gravity";

const cld = new Cloudinary({
  cloud: {
    cloudName: process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME,
  },
});

// Explicitly export props to satisfy IntrinsicAttributes in other files
export interface LearningCardProps {
  item: LearningVideo;
  onPressCard?: () => void;
  onBookmarkPress?: () => void;
}

export default function LearningCard({ 
  item, 
  onPressCard, 
  onBookmarkPress 
}: LearningCardProps) {

  // Generate optimized thumbnail from video or fallback to static URL
  const optimizedThumbnail = useMemo(() => {
    if (item.cloudinaryPublicId) {
      return cld.video(item.cloudinaryPublicId)
        .resize(
          thumbnail()
            .width(800)
            .gravity(autoGravity()) // Uses AI to find the best frame
        )
        .format("auto")
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
        <View style={styles.playOverlay}>
          <Ionicons name="play-circle" size={50} color="rgba(255,255,255,0.8)" />
        </View>
      </View>

      {/* Content Body */}
      <View style={styles.infoContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
          <Pressable onPress={onBookmarkPress} hitSlop={10}>
            <Ionicons 
              name={item.isBookmarked ? "bookmark" : "bookmark-outline"} 
              size={22} 
              color={item.isBookmarked ? "#007AFF" : "#666"} 
            />
          </Pressable>
        </View>
        
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>

        {/* Membership Access Label */}
        {item.accessType === "subscriber" && (
          <View style={styles.subscriberBadge}>
            <Ionicons name="star" size={12} color="#fff" />
            <Text style={styles.subscriberText}>SUBSCRIBER ONLY</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
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
  imageContainer: { height: 180, backgroundColor: "#eee", position: "relative" },
  thumbnail: { width: "100%", height: "100%" },
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
  playOverlay: { 
    ...StyleSheet.absoluteFillObject, 
    justifyContent: "center", 
    alignItems: "center" 
  },
  infoContainer: { padding: 15 },
  headerRow: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", 
    marginBottom: 5 
  },
  title: { fontSize: 18, fontWeight: "bold", color: "#1a1a1a", flex: 1, marginRight: 10 },
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
  subscriberText: { color: "#fff", fontSize: 10, fontWeight: "800", marginLeft: 4 },
});