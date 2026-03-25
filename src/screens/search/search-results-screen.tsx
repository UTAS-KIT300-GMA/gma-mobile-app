import { AppHeader } from "@/components/AppHeader";
import { EventCard } from "@/components/EventCard";
import { colors } from "@/theme/ThemeProvider";
import { EventDoc } from "@/types/type";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
	ActivityIndicator,
	FlatList,
	StyleSheet,
	Text,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/* The `SearchResultsScreen` component is responsible for displaying the results 
of a search query. It receives several props to manage the state and behavior of 
the screen: */

interface SearchResultsScreenUI {
  events: EventDoc[];
  loading: boolean;
  bookmarkedIds: Record<string, boolean>;
  onBookmark: (event: EventDoc) => Promise<void>;
  onCardPress: (item: EventDoc) => void;
  onRsvp: (item: EventDoc) => void;
  onBack: () => void;
  title?: string;
}

export const SearchResultsScreen: React.FC<SearchResultsScreenUI> = ({
  events,
  loading,
  bookmarkedIds,
  onBookmark,
  onCardPress,
  onRsvp,
  onBack,
  title = "Search Results",
}) => {
  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader title="Search Results" showBack onPressBack={onBack} />

      <View style={styles.container}>
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color={colors.saveBtnColor} size="large" />
          </View>
        ) : (
          <FlatList
            data={events}
            keyExtractor={(item) => item.id}
            contentContainerStyle={[
              styles.listContent,
              events.length === 0 && styles.emptyListContent,
            ]}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons
                  name="search-outline"
                  size={58}
                  color={colors.darkGrey}
                />
                <Text style={styles.emptyTitle}>No matching events found</Text>
                <Text style={styles.emptySubtitle}>
                  Try a different keyword or filter.
                </Text>
              </View>
            }
            renderItem={({ item }) => (
              <EventCard
                event={item}
                showBookmark
                bookmarked={!!bookmarkedIds[item.id]}
                onPressBookmark={() => onBookmark(item)}
                onPressRsvp={() => onRsvp(item)}
                onPressCard={() => onCardPress(item)}
              />
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.textOnPrimary,
  },

  container: {
    flex: 1,
  },

  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 6,
  },

  backButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.saveBtnColor,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
  },

  backButtonText: {
    color: colors.saveBtnTextColor,
    fontSize: 14,
    fontWeight: "700",
  },

  resultCount: {
    color: colors.darkGrey,
    fontSize: 14,
    fontWeight: "600",
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  listContent: {
    padding: 10,
    paddingBottom: 24,
  },

  emptyListContent: {
    flexGrow: 1,
    justifyContent: "center",
  },

  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
	paddingHorizontal: 28,
	marginBottom: 90,
	
  },

  emptyTitle: {
    marginTop: 14,
    fontSize: 18,
    fontWeight: "700",
    color: colors.saveBtnTextColor,
    textAlign: "center",
  },

  emptySubtitle: {
    marginTop: 8,
    fontSize: 14,
    color: colors.darkGrey,
    textAlign: "center",
    lineHeight: 20,
  },
});
