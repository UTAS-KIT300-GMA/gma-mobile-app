import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '@/components/AppHeader';
import { Ionicons } from '@expo/vector-icons';
import { formatDateTime } from '@/components/utils'; 
import { colors } from '@/theme/ThemeProvider';

interface Props {
  event: any;
  loading: boolean;
  isBookmarked: boolean;
  onBookmark: () => void;
  onBack: () => void;
  onBook: () => void; 
}

export default function EventDetailUI({ event, loading, isBookmarked, onBookmark, onBack, onBook }: Props) {
  // If the loading var is true, show the spinner instruction instead of the screen.
  if (loading || !event) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <AppHeader title="Event Details" showBack onPressBack={onBack} />
      
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <Image source={{ uri: event.image || 'https://via.placeholder.com/400' }} style={styles.image} />
        
        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{event.title}</Text>
            <TouchableOpacity onPress={onBookmark}>
              <Ionicons name={isBookmarked ? "bookmark" : "bookmark-outline"} size={28} color="#F2C654" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.dateText}>
            <Ionicons name="calendar" size={16} /> {event.dateTime ? formatDateTime(event.dateTime) : "Date TBD"}
          </Text>
          
          <Text style={styles.description}>{event.description || "No description provided."}</Text>
        </View>
      </ScrollView>

      
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.bookButton} onPress={onBook}>
          <Text style={styles.bookButtonText}>RSVP / Book Now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  image: { width: '100%', height: 250 },
  content: { padding: 20 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  title: { fontSize: 24, fontWeight: 'bold', flex: 1, color: '#333' },
  dateText: { fontSize: 16, color: '#666', marginBottom: 20 },
  description: { fontSize: 16, lineHeight: 24, color: '#444' },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, backgroundColor: '#fff', borderTopWidth: 1, borderColor: '#eee' },
  bookButton: { backgroundColor: '#9D246E', padding: 18, borderRadius: 12, alignItems: 'center' },
  bookButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});