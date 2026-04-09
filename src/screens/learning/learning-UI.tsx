import { LearningEvent } from "@/app/(tabs)/learning";
import { AppHeader } from "@/components/AppHeader";
import { colors } from "@/theme/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import VideoPlayer from "./video-player";

interface Props {
  events: LearningEvent[];
  loading: boolean;
  expandedId: string | null;
  onBookmarkPress?: (id: string) => void;
  onCardPress?: (item: LearningEvent) => void;
}

export const LearningScreenUI: React.FC<Props> = ({
  events,
  loading,
  expandedId,
  onBookmarkPress,
  onCardPress,
}) => {
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <AppHeader title="GMA Connect" />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Recommended Learning</Text>

        {events.map((item) => {
          const isExpanded = expandedId === item.id;

          return (
            <View key={item.id} style={styles.card}>
              {isExpanded ? (
                <View style={styles.expandedMediaWrapper}>
                  <View style={styles.bookmarkExpandedWrap}>
                    <TouchableOpacity
                      style={styles.bookmarkIcon}
                      onPress={() => onBookmarkPress?.(item.id)}
                    >
                      <Ionicons
                        name={
                          item.isBookmarked ? "bookmark" : "bookmark-outline"
                        }
                        size={18}
                        color="#F2C654"
                      />
                    </TouchableOpacity>
                  </View>

                  <VideoPlayer videoUrl={item.videoUrl || ""} />
                </View>
              ) : (
                <ImageBackground
                  source={{
                    uri:
                      item.thumbnailUrl ||
                      "https://www.w3schools.com/html/mov_bbb.mp4",
                  }}
                  style={styles.thumbnailArea}
                  imageStyle={styles.cardImage}
                >
                  <View style={styles.overlay}>
                    <TouchableOpacity
                      style={styles.bookmarkIcon}
                      onPress={() => onBookmarkPress?.(item.id)}
                    >
                      <Ionicons
                        name={
                          item.isBookmarked ? "bookmark" : "bookmark-outline"
                        }
                        size={18}
                        color="#F2C654"
                      />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.centerPlayButton}
                      onPress={() => onCardPress?.(item)}
                      activeOpacity={0.85}
                    >
                      <Ionicons
                        name="play-circle"
                        size={64}
                        color="rgba(255,255,255,0.88)"
                      />
                    </TouchableOpacity>
                  </View>
                </ImageBackground>
              )}

              <View style={styles.infoSection}>
                <View style={styles.infoTextWrap}>
                  <Text style={styles.title} numberOfLines={isExpanded ? 3 : 2}>
                    {item.title}
                  </Text>

                  <Text style={styles.duration}>{item.duration}</Text>

                  {isExpanded && (
                    <Text style={styles.description}>
                      {item.description || "No description available yet."}
                    </Text>
                  )}
                </View>

                {isExpanded ? (
                  <TouchableOpacity
                    style={styles.closeBtn}
                    onPress={() => onCardPress?.(item)}
                  >
                    <Text style={styles.closeBtnText}>Close</Text>
                  </TouchableOpacity>
                ) : (
                  <View
                    style={[
                      styles.accessBadge,
                      item.accessType === "subscriber"
                        ? styles.subscriberBadge
                        : styles.freeBadge,
                    ]}
                  >
                    <Text
                      style={[
                        styles.accessBadgeText,
                        item.accessType === "subscriber"
                          ? styles.subscriberBadgeText
                          : styles.freeBadgeText,
                      ]}
                    >
                      {item.accessType === "subscriber"
                        ? "Subscribers only"
                        : "Free"}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          );
        })}

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.textOnPrimary,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.textOnPrimary,
  },
  container: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.saveBtnTextColor,
    marginBottom: 15,
    paddingHorizontal: 8,
    paddingTop: 10,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 18,
    overflow: "hidden",
    shadowColor: colors.saveBtnTextColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 4,
  },
  thumbnailArea: {
    height: 210,
  },
  cardImage: {
    borderRadius: 16,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.22)",
    padding: 15,
    justifyContent: "space-between",
  },
  centerPlayButton: {
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  expandedMediaWrapper: {
    position: "relative",
    backgroundColor: "#000",
  },
  bookmarkExpandedWrap: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 10,
  },
  bookmarkIcon: {
    alignSelf: "flex-end",
    backgroundColor: colors.textOnPrimary,
    padding: 6,
    borderRadius: 8,
  },
  infoSection: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 14,
  },
  infoTextWrap: {
    flex: 1,
    paddingRight: 10,
  },
  title: {
    color: colors.saveBtnTextColor,
    fontSize: 16,
    fontWeight: "700",
  },
  duration: {
    color: "#777",
    fontSize: 12,
    marginTop: 4,
  },
  description: {
    color: "#444",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 10,
  },
  accessBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 10,
    alignSelf: "flex-end",
  },
  freeBadge: {
    backgroundColor: "#E8F7EE",
  },
  subscriberBadge: {
    backgroundColor: "#FCE8E8",
  },
  accessBadgeText: {
    fontSize: 12,
    fontWeight: "700",
  },
  freeBadgeText: {
    color: "#1D7A46",
  },
  subscriberBadgeText: {
    color: "#B03A3A",
  },
  closeBtn: {
    backgroundColor: colors.saveBtnColor,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 10,
    alignSelf: "flex-end",
  },
  closeBtnText: {
    fontWeight: "700",
    fontSize: 12,
    color: colors.saveBtnTextColor,
  },
  bottomSpacing: {
    height: 24,
  },
});
