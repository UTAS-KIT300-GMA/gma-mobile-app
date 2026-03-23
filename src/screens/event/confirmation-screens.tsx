import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export const BookingConfirmedUI = ({ details, onGoToBookings, onViewDetails }: any) => (
  <SafeAreaView style={styles.safe}>
    <View style={styles.header}>
      <TouchableOpacity onPress={onViewDetails}>
        <Ionicons name="chevron-back" size={28} color="#9D246E" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Payment</Text>
      <View style={{ width: 28 }} />
    </View>

    <View style={styles.content}>
      <Ionicons name="checkmark-circle" size={100} color="#4CAF50" />
      <Text style={styles.statusText}>Booking Confirmed</Text>

      <View style={styles.card}>
        <Image source={{ uri: 'https://via.placeholder.com/300' }} style={styles.cardImg} />
        <View style={styles.cardOverlay}>
          <Text style={styles.eventTitle}>{details.title}</Text>
          <Text style={styles.eventInfo}>{details.time}{"\n"}{details.location}</Text>
        </View>
      </View>

      <View style={styles.detailsBox}>
        <View style={styles.row}><Text>Ticket Type:</Text><Text>Free</Text></View>
        <View style={styles.row}><Text>Number of Ticket:</Text><Text>1</Text></View>
        <View style={styles.row}><Text>Booking ID:</Text><Text>{details.bookingId}</Text></View>
        <View style={[styles.row, { marginTop: 10 }]}>
          <Text style={{ fontWeight: 'bold' }}>Total Cost:</Text>
          <Text style={{ fontWeight: 'bold' }}>{details.totalCost}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.mainBtn} onPress={onGoToBookings}>
        <Text style={styles.mainBtnText}>My bookings</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.secBtn} onPress={onViewDetails}>
        <Text style={styles.secBtnText}>Event details</Text>
      </TouchableOpacity>
    </View>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FDF5F0' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: 'white' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#9D246E' },
  content: { flex: 1, alignItems: 'center', padding: 20 },
  statusText: { fontSize: 22, fontWeight: 'bold', color: '#3A1D3D', marginVertical: 15 },
  card: { width: '100%', height: 180, borderRadius: 15, overflow: 'hidden', marginBottom: 20 },
  cardImg: { width: '100%', height: '100%' },
  cardOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 15, backgroundColor: 'rgba(0,0,0,0.4)' },
  eventTitle: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  eventInfo: { color: 'white', fontSize: 12 },
  detailsBox: { backgroundColor: 'white', width: '100%', padding: 20, borderRadius: 15, marginBottom: 25 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  mainBtn: { backgroundColor: '#9D246E', width: '100%', padding: 15, borderRadius: 10, alignItems: 'center', marginBottom: 12 },
  mainBtnText: { color: 'white', fontWeight: 'bold' },
  secBtn: { backgroundColor: 'white', width: '100%', padding: 15, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: '#DDD' },
  secBtnText: { color: '#9D246E', fontWeight: 'bold' },
});