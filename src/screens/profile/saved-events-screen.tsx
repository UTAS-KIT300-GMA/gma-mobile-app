import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator, 
  FlatList,
  ImageBackground 
} from 'react-native'; 
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from '@expo/vector-icons';
import { EventDoc } from '@/types/type';
import { formatDateTime } from "@/components/utils"; 

interface SavedEventsUIProps {
  events: EventDoc[];
  loading: boolean;
  onBack: () => void;
  onPressCard: (event: EventDoc) => void;
  onRemoveBookmark: (event: EventDoc) => void;
  onRsvp: (event: EventDoc) => void;
}

export const SavedEventsUI = ({ 
  events, 
  loading,
  onBack,
  onPressCard,
  onRemoveBookmark,
  onRsvp
}: SavedEventsUIProps) => {

  const renderItem = ({ item }: { item: EventDoc }) => (
    <TouchableOpacity onPress={() => onPressCard(item)} activeOpacity={0.9}>
      <ImageBackground 
        source={{ uri: item.image || 'https://via.placeholder.com/300' }} 
        style={styles.card} 
        imageStyle={{ borderRadius: 15 }}
      >
        <View style={styles.overlay}>
          <TouchableOpacity 
            style={styles.bookmarkBtn} 
            onPress={() => onRemoveBookmark(item)}
          >
            <Ionicons name="bookmark" size={20} color="#F2C654" />
          </TouchableOpacity>
          
          <View style={styles.footer}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.cardSub}>
                {item.dateTime ? formatDateTime(item.dateTime) : "Date TBD"}
              </Text> 
            </View>
            <TouchableOpacity style={styles.rsvpBtn} onPress={() => onRsvp(item)}>
              <Text style={styles.rsvpText}>RSVP/Book</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Ionicons name="chevron-back" size={28} color="#9D246E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Bookmarked Events</Text>
        <View style={{ width: 28 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#9D246E" />
        </View>
      ) : (
        <FlatList
          data={events}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listPadding}
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="bookmark-outline" size={60} color="#ccc" />
              <Text style={styles.emptyText}>No bookmarked events yet!</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: 'white' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#9D246E' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 },
  listPadding: { padding: 16 },
  card: { height: 180, marginBottom: 15 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 15, padding: 15, justifyContent: 'space-between' },
  bookmarkBtn: { alignSelf: 'flex-end', backgroundColor: 'white', padding: 6, borderRadius: 8 },
  footer: { flexDirection: 'row', alignItems: 'flex-end' },
  cardTitle: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  cardSub: { color: 'white', fontSize: 12 },
  rsvpBtn: { backgroundColor: '#F2C654', padding: 10, borderRadius: 8 },
  rsvpText: { fontWeight: 'bold', fontSize: 12 },
  emptyText: { marginTop: 10, color: '#999', fontSize: 16 }
});