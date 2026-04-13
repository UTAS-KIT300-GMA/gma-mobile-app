import { LearningVideo } from "@/app/(tabs)/learning";
import { AppHeader } from "@/components/AppHeader";
import { LearningCard } from "@/components/LearningCard";
import { colors } from "@/theme/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import VideoPlayer from "./video-player";

interface Props {
  events: LearningVideo[];
  loading: boolean;
  expandedId: string | null;
  onBookmarkPress?: (id: string) => void;
  onCardPress?: (item: LearningVideo) => void;
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
      <AppHeader title="GMA Learning" />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Recommended Learning</Text>

        {events.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              No learning videos available yet.
            </Text>
          </View>
        )}

        {events.map((item) => {
          const isExpanded = expandedId === item.id;
          const isSubscriberOnly = item.accessType === "subscriber";

          if (!isExpanded) {
            return (
              <LearningCard
                key={item.id}
                item={item}
                onPressCard={() => onCardPress?.(item)}
                onPressBookmark={() => onBookmarkPress?.(item.id)}
              />
            );
          }

          return (
            <View key={item.id} style={styles.expandedCard}>
              <View style={styles.expandedMediaWrapper}>
                <TouchableOpacity
                  style={styles.bookmarkButton}
                  onPress={() => onBookmarkPress?.(item.id)}
                  activeOpacity={0.85}
                >
                  <Ionicons
                    name={item.isBookmarked ? "bookmark" : "bookmark-outline"}
                    size={23}
                    color={colors.secondary}
                  />
                </TouchableOpacity>

                <VideoPlayer
                  key={`video-${item.id}`}
                  videoUrl={item.videoUrl}
                />
              </View>

              <View style={styles.infoSection}>
                <Text style={styles.title}>{item.title}</Text>

                <View style={styles.metaRow}>
                  <Text style={styles.duration}>{item.duration}</Text>

                  <View style={styles.ctaButton}>
                    {isSubscriberOnly && (
                      <Ionicons
                        name="lock-closed"
                        size={12}
                        color={colors.saveBtnTextColor}
                        style={styles.ctaIcon}
                      />
                    )}
                    <Text style={styles.ctaText}>
                      {isSubscriberOnly ? "Subscribers only" : "Free"}
                    </Text>
                  </View>
                </View>

                <Text style={styles.description}>
                  {item.description || "No description available yet."}
                </Text>

                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={() => onCardPress?.(item)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.closeBtnText}>Close</Text>
                </TouchableOpacity>
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
  emptyState: {
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  emptyStateText: {
    color: "#666",
    fontSize: 14,
  },
  expandedCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    marginBottom: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.textOnPrimary,
    shadowColor: colors.saveBtnTextColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 4,
  },
  expandedMediaWrapper: {
    position: "relative",
    backgroundColor: "#000",
  },
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
    zIndex: 3,
  },
  infoSection: {
    padding: 14,
  },
  title: {
    color: colors.saveBtnTextColor,
    fontSize: 18,
    fontWeight: "800",
    lineHeight: 24,
    textAlign: "left",
  },
  metaRow: {
    marginTop: 10,
    marginBottom: 6,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  duration: {
    color: "#777",
    fontSize: 12,
    flexShrink: 1,
  },
  ctaButton: {
    backgroundColor: colors.saveBtnColor,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    minHeight: 34,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  ctaText: {
    color: colors.saveBtnTextColor,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
  ctaIcon: {
    marginRight: 6,
  },
  description: {
    color: "#444",
    fontSize: 14,
    lineHeight: 22,
    marginTop: 10,
    textAlign: "justify",
  },
  closeBtn: {
    backgroundColor: colors.saveBtnColor,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginTop: 16,
  },
  closeBtnText: {
    fontWeight: "800",
    fontSize: 12,
    color: colors.saveBtnTextColor,
    letterSpacing: 0.4,
  },
  bottomSpacing: {
    height: 24,
  },
});
