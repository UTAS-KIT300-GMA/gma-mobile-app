import { AppHeader } from "@/components/AppHeader";
import LearningCard from "@/components/LearningCard";
import { colors } from "@/theme/ThemeProvider";
import { LearningDoc } from "@/types/type";
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
  events: LearningDoc[];
  loading: boolean;
  expandedId: string | null;
  onBookmarkPress?: (id: string) => void;
  onCardPress?: (item: LearningDoc) => void;
  onFilePress?: (url: string) => void;
}

export const LearningScreenUI: React.FC<Props> = ({
  events,
  loading,
  expandedId,
  onBookmarkPress,
  onCardPress,
  onFilePress,
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
                onBookmarkPress={() => onBookmarkPress?.(item.id)}
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

                {/* CLOUDINARY VIDEO PLAYER */}
                <VideoPlayer publicId={item.cloudinaryPublicId || ""} />
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

                {/* File RESOURCE BUTTON */}
                {item.fileId ? (
                  <TouchableOpacity
                    style={styles.fileButton}
                    onPress={() => onFilePress?.(item.fileId!)}
                  >
                    <Ionicons name="document-text" size={18} color={colors.saveBtnTextColor} />
                    <Text style={styles.fileButtonText}>View Learning Material (FILE)</Text>
                  </TouchableOpacity>
                ) : null}

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
  safe: { flex: 1, backgroundColor: colors.textOnPrimary },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.textOnPrimary },
  container: { paddingHorizontal: 16 },
  sectionTitle: { fontSize: 18, fontWeight: "800", color: colors.saveBtnTextColor, marginBottom: 15, paddingHorizontal: 8, paddingTop: 10 },
  emptyState: { paddingHorizontal: 8, paddingTop: 8 },
  emptyStateText: { color: "#666", fontSize: 14 },
  
  expandedCard: { 
    backgroundColor: "#fff", 
    borderRadius: 15, 
    marginBottom: 12, 
    overflow: "hidden", 
    borderWidth: 1, 
    borderColor: '#eee', 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 4, 
    elevation: 4 
  },
  expandedMediaWrapper: { position: "relative", backgroundColor: "#000" },
  bookmarkButton: { position: "absolute", right: 10, top: 10, width: 43, height: 39, borderRadius: 11, alignItems: "center", justifyContent: "center", backgroundColor: colors.textOnPrimary, zIndex: 3 },
  infoSection: { padding: 14 },
  title: { color: colors.saveBtnTextColor, fontSize: 18, fontWeight: "800", lineHeight: 24 },
  metaRow: { marginTop: 10, marginBottom: 6, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  duration: { color: "#777", fontSize: 12 },
  ctaButton: { backgroundColor: colors.saveBtnColor, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, flexDirection: "row", alignItems: "center" },
  ctaText: { color: colors.saveBtnTextColor, fontSize: 12, fontWeight: "800" },
  ctaIcon: { marginRight: 6 },
  description: { color: "#444", fontSize: 14, lineHeight: 22, marginTop: 10, textAlign: "justify" },
  
  fileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginTop: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  fileButtonText: {
    marginLeft: 10,
    fontSize: 14,
    fontWeight: '700',
    color: colors.saveBtnTextColor,
  },

  closeBtn: { backgroundColor: colors.saveBtnColor, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8, alignSelf: "flex-start", marginTop: 16 },
  closeBtnText: { fontWeight: "800", fontSize: 12, color: colors.saveBtnTextColor },
  bottomSpacing: { height: 24 },
});