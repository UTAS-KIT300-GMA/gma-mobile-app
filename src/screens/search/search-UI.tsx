import DateTimePicker from "@react-native-community/datetimepicker";
import React from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppHeader } from "@/components/AppHeader";
import { InterestKey, INTEREST_TAGS } from "@/types/type";


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
}) => {
  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader title="GMA Connect" />
      <ScrollView contentContainerStyle={styles.container}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search events / courses"
          style={styles.searchBar}
          placeholderTextColor="#9ca3af"
        />

        <Text style={styles.h1}>Interest Tags</Text>
        <View style={styles.tagsWrap}>
          {INTEREST_TAGS.map((t) => {
            const active = selected[t.key];
            return (
              <Pressable
                key={t.key}
                onPress={() => toggleTag(t.key)}
                style={[styles.tag, active && styles.tagActive]}
              >
                <Text style={[styles.tagText, active && styles.tagTextActive]}>
                  {t.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.h1}>Location</Text>
        <TextInput
          value={location}
          onChangeText={setLocation}
          placeholder="Enter location"
          style={styles.input}
          placeholderTextColor="#9ca3af"
        />
        <Text style={styles.helper}>
          (Google location autocomplete can be added next; this is a free-text
          placeholder for now.)
        </Text>

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
            <Text style={styles.buttonText}>Apply</Text>
          </Pressable>
          <Pressable
            style={[styles.button, styles.resetButton]}
            onPress={handleReset}
          >
            <Text style={styles.buttonText}>Reset</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#ffffff" },
  container: { padding: 16, paddingBottom: 24 },
  searchBar: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    backgroundColor: "#ffffff",
  },
  h1: {
    marginTop: 18,
    marginBottom: 10,
    fontSize: 14,
    fontWeight: "800",
    color: "#111827",
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
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
  },
  tagActive: {
    backgroundColor: "#a64d79",
    borderColor: "#a64d79",
  },
  tagText: { fontSize: 12, fontWeight: "700", color: "#374151" },
  tagTextActive: { color: "#ffffff" },
  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
  },
  dateText: { color: "#111827", fontSize: 15, fontWeight: "600" },
  helper: { marginTop: 8, color: "#6b7280", fontSize: 12 },
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
  applyButton: { backgroundColor: "#25292e" },
  resetButton: { backgroundColor: "#a64d79" },
  buttonText: { color: "#ffffff", fontWeight: "800" },
});