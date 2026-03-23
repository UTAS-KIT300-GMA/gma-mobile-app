import { AppHeader } from "@/components/AppHeader";
import React from 'react';
import { 
  ScrollView, 
  View, 
  Text, 
  StyleSheet, 
  ImageBackground, 
  TouchableOpacity, 
  ActivityIndicator 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LearningEvent } from "@/app/(tabs)/learning";

interface Props {
  events: LearningEvent[];
  loading: boolean;
}

export const LearningScreenUI: React.FC<Props> = ({ events, loading }) => {
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#9D246E" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <AppHeader title="GMA Connect" />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Recommended Learning</Text>

        {events.map((item) => (
          <ImageBackground 
            key={item.id} 
            source={{ uri: item.thumbnailUrl || 'https://via.placeholder.com/400x200' }} 
            style={styles.card}
            imageStyle={{ borderRadius: 15 }}
          >
            <View style={styles.cardOverlay}>
              <TouchableOpacity style={styles.bookmarkIcon}>
                <Ionicons name={item.isBookmarked ? "bookmark" : "bookmark-outline"} size={18} color="#F2C654" />
              </TouchableOpacity>

              <Ionicons name="play-circle" size={55} color="rgba(255,255,255,0.8)" style={styles.playBtn} />

              <View style={styles.cardFooter}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.eventTitle} numberOfLines={2}>{item.title}</Text>
                  <Text style={styles.eventDuration}>{item.duration}</Text>
                </View>
                <TouchableOpacity style={styles.rsvpBtn}>
                  <Text style={styles.rsvpText}>RSVP/Book</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ImageBackground>
        ))}

        <Text style={[styles.sectionTitle, { marginTop: 10 }]}>More content</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFF' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { paddingHorizontal: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15 },
  logo: { fontSize: 26, fontWeight: 'bold', color: '#9D246E' },
  headerIcons: { flexDirection: 'row', alignItems: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#4A2A4E', marginBottom: 15 },
  card: { height: 210, marginBottom: 20, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 },
  cardOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 15, padding: 15, justifyContent: 'space-between' },
  bookmarkIcon: { alignSelf: 'flex-end', backgroundColor: '#FFF', padding: 6, borderRadius: 8 },
  playBtn: { alignSelf: 'center' },
  cardFooter: { flexDirection: 'row', alignItems: 'flex-end' },
  eventTitle: { color: '#FFF', fontSize: 15, fontWeight: 'bold' },
  eventDuration: { color: '#FFF', fontSize: 12, opacity: 0.9 },
  rsvpBtn: { backgroundColor: '#F2C654', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, marginLeft: 10 },
  rsvpText: { fontWeight: 'bold', fontSize: 12, color: '#333' }
});