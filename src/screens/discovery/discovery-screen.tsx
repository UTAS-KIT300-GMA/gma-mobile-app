import React from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, FlatList } from 'react-native'; 
import { SafeAreaView } from "react-native-safe-area-context";
import { AppHeader } from "@/components/AppHeader";
import { EventCard } from "@/components/EventCard";
import { EventDoc } from "@/types/type";
import { Ionicons } from '@expo/vector-icons';

interface DiscoveryProps {
  filteredEvents: EventDoc[];
  loading: boolean;
  bookmarkedIds: Record<string, boolean>;
  onBookmark: (event: EventDoc) => Promise<void>;
  onCardPress: (item: EventDoc) => void;
  onRsvp: (item: EventDoc) => void;
  category: string; 
  setCategory: (cat: string) => void;
  options: { key: string; label: string }[];
  title?: string; 
}

export const DiscoveryScreen: React.FC<DiscoveryProps> = ({ 
  filteredEvents, 
  loading, 
  bookmarkedIds, 
  onBookmark, 
  onCardPress,
  onRsvp,
  category,    
  setCategory, 
  options,
  title = "GMA Connect" 
}) => {
  return (
    <SafeAreaView style={styles.safe}>

      <AppHeader title={title} />
      
      <View style={styles.container}>
        {options.length > 0 && (
          <View style={styles.categoryRow}>
            {options.map((opt) => (
              <Pressable
                key={opt.key}
                onPress={() => setCategory(opt.key)}
                style={[styles.categoryPill, opt.key === category && styles.categoryPillActive]}
              >
                <Text style={[styles.categoryText, opt.key === category && styles.categoryTextActive]}>
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color="#a64d79" size="large" />
          </View>
        ) : (
          <FlatList
            data={filteredEvents}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.center}>
                <Ionicons name="calendar-outline" size={50} color="#ccc" />
                <Text style={styles.emptyText}>No events found.</Text>
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
  safe: { flex: 1, backgroundColor: "#ffffff" },
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", marginTop: 50 },
  listContent: { padding: 10, paddingBottom: 24 },
  categoryRow: { flexDirection: "row", padding: 10, gap: 8 },
  categoryPill: { flex: 1, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: "#e5e7eb", alignItems: "center" },
  categoryPillActive: { backgroundColor: "#a64d79", borderColor: "#a64d79" },
  categoryText: { fontSize: 14, fontWeight: "700", color: "#374151" },
  categoryTextActive: { color: "#ffffff" },
  emptyText: { marginTop: 10, color: '#999' }
});