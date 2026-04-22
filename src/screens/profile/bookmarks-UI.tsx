import { AppHeader } from "@/components/AppHeader";
import { EventCard } from "@/components/EventCard";
import LearningCard from "@/components/LearningCard";
import { colors } from "@/theme/ThemeProvider";
import { EventDoc, LearningDoc } from "@/types/type";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  SectionList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface BookmarkedEventsUIProps {
  events: EventDoc[];
  learningContents: LearningDoc[];
  loading: boolean;
  onBack: () => void;
  onPressCard: (event: EventDoc) => void;
  onRemoveBookmark: (item: EventDoc | LearningDoc) => Promise<void>;
  onRsvp: (event: EventDoc) => void;
  onPressLearning: () => void;
  onRemoveCourseBookmark: (item: EventDoc | LearningDoc) => Promise<void>;
}

export const BookmarkedEventsUI = ({
  events,
  learningContents,
  loading,
  onBack,
  onPressCard,
  onRemoveBookmark,
  onRsvp,
  onPressLearning,
  onRemoveCourseBookmark,
}: BookmarkedEventsUIProps) => {
  const sections: {
    title: string;
    data: (EventDoc | LearningDoc)[];
    type: string;
  }[] = [
    { title: "Saved Events", data: events, type: "event" },
    { title: "Saved Learnings", data: learningContents, type: "learning" },
  ].filter((s) => s.data.length > 0);

  const isEmpty = events.length === 0 && learningContents.length === 0;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <AppHeader title="Bookmarks" showBack={true} />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : isEmpty ? (
        <View style={styles.center}>
          <Ionicons name="bookmark-outline" size={60} color={colors.darkGrey} />
          <Text style={styles.emptyText}>No bookmarks yet!</Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listPadding}
          renderSectionHeader={({ section: { title } }) => (
            <Text style={styles.sectionTitle}>{title}</Text>
          )}
          renderItem={({ item, section }) => {
            if (section.type === "event") {
              const event = item as EventDoc;
              return (
                <EventCard
                  event={event}
                  showBookmark
                  bookmarked={true}
                  onPressCard={() => onPressCard(event)}
                  onPressBookmark={() => onRemoveBookmark(event)}
                  onPressRsvp={() => onRsvp(event)}
                />
              );
            }
            const content = item as LearningDoc;
            return (
              <LearningCard
                item={{ ...content, isBookmarked: true }}
                onPressCard={() => onPressLearning()}
                onBookmarkPress={() => onRemoveCourseBookmark(content)}
              />
            );
          }}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.textOnPrimary },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 100,
  },
  listPadding: { padding: 16 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    color: colors.primary,
  },
  rsvpBtn: {
    backgroundColor: colors.saveBtnColor,
    padding: 10,
    borderRadius: 8,
  },
  rsvpText: { fontWeight: "bold", fontSize: 12 },
  emptyText: { marginTop: 10, color: colors.darkGrey, fontSize: 16 },
});
