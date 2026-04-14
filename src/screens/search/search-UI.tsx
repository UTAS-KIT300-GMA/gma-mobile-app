import { AppHeader } from "@/components/AppHeader";
import { colors } from "@/theme/ThemeProvider";
import { INTEREST_TAGS, InterestKey } from "@/types/type";
import {Ionicons, MaterialCommunityIcons} from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import React from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface SearchScreenUIProps {
  query: string;
  setQuery: (text: string) => void;
  selected: Record<InterestKey, boolean>;
  toggleTag: (key: InterestKey) => void;
  location: string;
  setLocation: (text: string) => void;
  date: Date | null;
  setDate: (date: Date) => void;
  showPicker: boolean;
  setShowPicker: (show: boolean) => void;
  handleApply: () => void;
  handleReset: () => void;
  isAiLoading: boolean;
  onAiSearch: (userQuery: string) => void;
}

export const SearchScreenUI: React.FC<SearchScreenUIProps> = ({
  query,
  setQuery,
  selected,
  toggleTag,
  location,
  setLocation,
  date,
  setDate,
  showPicker,
  setShowPicker,
  handleApply,
  handleReset,
  isAiLoading,
  onAiSearch,
}) => {
  const [showInterests, setShowInterests] = React.useState(false);

  // Determine if the query looks like a natural sentence
  const isLongQuery = query.trim().split(/\s+/).length > 4;

  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader title="GMA Search" />

      <Modal transparent visible={isAiLoading}>
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Gemini is analyzing your request...</Text>
        </View>
      </Modal>

      <ScrollView contentContainerStyle={styles.container}>
        <View style={[styles.searchBar, isLongQuery && styles.searchBarAiActive]}>
          <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Try: 'I love Japanese food in Hobart...'"
              style={styles.searchInput}
              placeholderTextColor={colors.darkGrey}
              onSubmitEditing={() => (isLongQuery ? onAiSearch(query) : handleApply())}
              returnKeyType="search"
              multiline={false}
          />
          <Pressable
              onPress={() => (isLongQuery ? onAiSearch(query) : handleApply())}
              style={styles.searchIconButton}
          >
            <MaterialCommunityIcons
                name={(isLongQuery ? "creation" : "magnify") as any}
                size={24}
                color={isLongQuery ? "#8A2BE2" : colors.primary}
            />
          </Pressable>
        </View>

        {isLongQuery && (
            <Text style={styles.aiHint}>✨ Natural language detected. Tap sparkles to use AI search.</Text>
        )}

        {/* Interest Tags */}
        <Pressable
          style={styles.sectionHeader}
          onPress={() => setShowInterests(!showInterests)}
        >
          <Text style={styles.h1}>Interest Tags</Text>
          <Ionicons
            name={showInterests ? "chevron-up" : "chevron-down"}
            size={20}
            color={colors.saveBtnTextColor}
          />
        </Pressable>
        {showInterests && (
          <View style={styles.tagsWrap}>
            {INTEREST_TAGS.map((t) => {
              const active = selected[t.key];
              return (
                <Pressable
                  key={t.key}
                  onPress={() => toggleTag(t.key)}
                  style={[styles.tag, active && styles.tagActive]}
                >
                  <Text
                    style={[styles.tagText, active && styles.tagTextActive]}
                  >
                    {t.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}

        {/* Location Input */}
        <Text style={styles.h1}>Location</Text>
        <TextInput
          value={location}
          onChangeText={setLocation}
          placeholder="Enter location"
          style={styles.input}
          placeholderTextColor={colors.primary}
        />
        <Text style={styles.helper}>
          (Google location autocomplete can be added next; this is a free-text
          placeholder for now.)
        </Text>

        {/* Date Picker */}
        <Text style={styles.h1}>Date</Text>
        <Pressable style={styles.input} onPress={() => setShowPicker(true)}>
          <Text style={styles.dateText}>
            {date ? date.toLocaleDateString("en-CA") : "Select date"}
          </Text>
        </Pressable>
        {showPicker && (
          <DateTimePicker
            value={date ?? new Date()}
            mode="date"
            display="default"
            onChange={(_, selectedDate) => {
              setShowPicker(false);
              if (selectedDate) setDate(selectedDate);
            }}
          />
        )}

        <View style={styles.buttonRow}>
          <Pressable
            style={[styles.button, styles.applyButton]}
            onPress={handleApply}
          >
            <Text style={styles.applyButton}>Apply</Text>
          </Pressable>
          <Pressable
            style={[styles.button, styles.resetButton]}
            onPress={handleReset}
          >
            <Text style={styles.resetButton}>Reset</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.textOnPrimary,
  },

  container: {
    padding: 20,
    paddingBottom: 24,
  },

  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.textOnPrimary,
    borderRadius: 24,
    elevation: 3,
    paddingHorizontal: 16,
    backgroundColor: colors.textOnPrimary,
  },

  searchBarAiActive: {
    borderColor: "#8A2BE2", // Purple for AI
    backgroundColor: "#FDF5FF",
    borderWidth: 2,
  },
  loadingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  searchIconButton: { padding: 4 },
  aiHint: {
    fontSize: 12,
    color: "#8A2BE2",
    marginTop: 8,
    marginLeft: 16,
    fontWeight: "600"
  },
  loadingText: { marginTop: 15, fontSize: 16, color: "#8A2BE2", fontWeight: "600" },

  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
  },

  sectionHeader: {
    marginTop: 18,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  h1: {
    marginTop: 18,
    marginBottom: 10,
    fontSize: 18,
    fontWeight: "800",
    color: colors.saveBtnTextColor,
  },

  tagsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  tag: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.textOnPrimary,
    elevation: 2,
    backgroundColor: colors.textOnPrimary,
  },

  tagText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textOnSecondary,
  },

  tagActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  tagTextActive: { color: colors.textOnPrimary },

  input: {
    borderWidth: 1,
    borderColor: colors.textOnPrimary,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    fontWeight: "500",
    elevation: 2,
    backgroundColor: colors.textOnPrimary,
  },

  dateText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: "600",
  },

  helper: {
    marginTop: 8,
    color: colors.darkGrey,
    fontSize: 12,
  },

  buttonRow: {
    marginTop: 18,
    flexDirection: "row",
    gap: 12,
  },

  button: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },

  applyButton: {
    backgroundColor: colors.saveBtnColor,
    color: colors.saveBtnTextColor,
    fontSize: 16,
    fontWeight: "600",
  },

  resetButton: {
    backgroundColor: colors.darkGrey,
    color: colors.textOnPrimary,
    fontSize: 16,
    fontWeight: "600",
  },
});
