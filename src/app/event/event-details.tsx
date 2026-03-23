import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { doc, getDoc, setDoc, deleteDoc, serverTimestamp } from "@react-native-firebase/firestore";
import { auth, db } from "@/services/authService"; // Or your unified firebase.ts file
import { AppHeader } from "@/components/AppHeader";
import { Ionicons } from "@expo/vector-icons";

export default function EventDetailScreen() {
  const router = useRouter();
  // Catches the unique event ID from the navigation parameters.
  // Stores it in the eventId var.
  const { id } = useLocalSearchParams(); 
  const eventId = id as string;
  
  // Stores the fetched event details, bookmark status, and loading state in vars.
  const [event, setEvent] = useState<any>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function fetchEvent() {
      if (!eventId) return;
      try {
        // Defines the path to the specific event in the 'events' collection.
        const eventRef = doc(db, "events", eventId);
        const eventSnap = await getDoc(eventRef);
        
        if (eventSnap.exists() && mounted) {
          const data = eventSnap.data();
          // Converts the Firestore timestamp to a readable string format.
          let parsedDate = data?.dateTime;
          if (data?.dateTime?.toDate) parsedDate = data.dateTime.toDate().toISOString();
          
          // Stores the combined ID and data in the event var.
          setEvent({ id: eventSnap.id, ...data, dateTime: parsedDate || null });
        }

        const uid = auth.currentUser?.uid;
        if (uid && mounted) {
          // Checks the user's private 'bookmarks' collection for this specific event ID.
          const bookmarkSnap = await getDoc(doc(db, "users", uid, "bookmarks", eventId));
          // Stores the true/false result in the isBookmarked var.
          setIsBookmarked(bookmarkSnap.exists());
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchEvent();
    return () => { mounted = false; };
  }, [eventId]);
  
  // Stores the function instructions for handleBookmark var.
  const handleBookmark = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    const bookmarkRef = doc(db, "users", uid, "bookmarks", eventId);
    const wasBookmarked = isBookmarked;
    setIsBookmarked(!wasBookmarked); 
    try {
      // If already saved, delete the doc. If not, create a new one with a timestamp.
      if (wasBookmarked) await deleteDoc(bookmarkRef);
      else await setDoc(bookmarkRef, { eventId, savedAt: serverTimestamp() });
    } catch (e) {
      // If the database fails, roll back the local isBookmarked store to its original state.
      setIsBookmarked(wasBookmarked); 
      Alert.alert("Error", "Could not update bookmark.");
    }
  };
  
  // Shows a loading spinner if the event data var is still empty.
  if (loading || !event) return <View style={styles.center}><ActivityIndicator size="large" color="#9D246E" /></View>;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <AppHeader title="Event Details" showBack onPressBack={() => router.back()} />
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <Image source={{ uri: event.image || 'https://via.placeholder.com/400' }} style={styles.image} />
        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{event.title}</Text>
            <TouchableOpacity onPress={handleBookmark}>
              <Ionicons name={isBookmarked ? "bookmark" : "bookmark-outline"} size={28} color="#F2C654" />
            </TouchableOpacity>
          </View>
          <Text style={styles.dateText}>
            <Ionicons name="calendar" size={16} /> {event.dateTime ? new Date(event.dateTime).toDateString() : "Date TBD"}
          </Text>
          <Text style={styles.description}>{event.description || "No description provided."}</Text>
        </View>
      </ScrollView>

      {/* THIS BUTTON SENDS THE USER TO THE BOOKING SCREEN */}
      <View style={styles.bottomBar}>
        <TouchableOpacity 
          style={styles.bookButton} 
          onPress={() => router.push({ pathname: "/event/booking", params: { eventId: event.id } } as any)}
        >
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