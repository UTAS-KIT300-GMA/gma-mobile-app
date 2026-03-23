import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '@/components/AppHeader';
import { Ionicons } from '@expo/vector-icons';

interface BookingUIProps {
  event: any;
  loading: boolean;
  processing: boolean;
  tickets: number;
  totalPrice: number;
  onBack: () => void;
  onIncreaseTickets: () => void;
  onDecreaseTickets: () => void;
  onConfirm: () => void;
}

export const BookingScreenUI: React.FC<BookingUIProps> = ({
  event,
  loading,
  processing,
  tickets,
  totalPrice,
  onBack,
  onIncreaseTickets,
  onDecreaseTickets,
  onConfirm,
}) => {
  if (loading || !event) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#9D246E" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <AppHeader title="Checkout" showBack onPressBack={onBack} />
      
      <View style={styles.container}>
        {/* Event Summary Card */}
        <View style={styles.summaryCard}>
          <Image source={{ uri: event.image || 'https://via.placeholder.com/150' }} style={styles.image} />
          <View style={styles.summaryText}>
            <Text style={styles.title} numberOfLines={2}>{event.title}</Text>
            <Text style={styles.subText}>
              {event.dateTime ? new Date(event.dateTime).toDateString() : "Date TBD"}
            </Text>
            <Text style={styles.priceText}>${event.price} per ticket</Text>
          </View>
        </View>

        {/* Ticket Counter */}
        <View style={styles.counterSection}>
          <Text style={styles.sectionTitle}>Number of Tickets</Text>
          <View style={styles.counterRow}>
            <TouchableOpacity style={styles.circleBtn} onPress={onDecreaseTickets}>
              <Ionicons name="remove" size={24} color="#9D246E" />
            </TouchableOpacity>
            
            <Text style={styles.ticketCount}>{tickets}</Text>
            
            <TouchableOpacity style={styles.circleBtn} onPress={onIncreaseTickets}>
              <Ionicons name="add" size={24} color="#9D246E" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Total Price */}
        <View style={styles.totalSection}>
          <Text style={styles.totalLabel}>Total Price</Text>
          <Text style={styles.totalAmount}>${totalPrice.toFixed(2)}</Text>
        </View>
      </View>

      {/* Confirm Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity 
          style={[styles.confirmBtn, processing && { opacity: 0.7 }]} 
          onPress={onConfirm}
          disabled={processing}
        >
          {processing ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.confirmBtnText}>Confirm Booking</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8f9fa' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, padding: 20 },
  summaryCard: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 15, padding: 15, marginBottom: 30, elevation: 2 },
  image: { width: 80, height: 80, borderRadius: 10, marginRight: 15 },
  summaryText: { flex: 1, justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 5 },
  subText: { color: '#666', marginBottom: 5 },
  priceText: { color: '#9D246E', fontWeight: 'bold' },
  counterSection: { backgroundColor: '#fff', borderRadius: 15, padding: 20, alignItems: 'center', marginBottom: 30 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 15 },
  counterRow: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  circleBtn: { width: 45, height: 45, borderRadius: 25, backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' },
  ticketCount: { fontSize: 24, fontWeight: 'bold', width: 40, textAlign: 'center' },
  totalSection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 20, borderRadius: 15 },
  totalLabel: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  totalAmount: { fontSize: 24, fontWeight: 'bold', color: '#9D246E' },
  bottomBar: { padding: 20, backgroundColor: '#fff', borderTopWidth: 1, borderColor: '#eee' },
  confirmBtn: { backgroundColor: '#F2C654', padding: 18, borderRadius: 12, alignItems: 'center' },
  confirmBtnText: { color: '#000', fontSize: 18, fontWeight: 'bold' }
});