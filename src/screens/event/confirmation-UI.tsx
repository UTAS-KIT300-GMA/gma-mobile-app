import { AppHeader } from "@/components/AppHeader";
import { colors } from "@/theme/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export const BookingConfirmedUI = ({
  details,
  onGoToBookings,
  onViewDetails,
}: any) => (
  <SafeAreaView style={styles.safe}>
    <AppHeader title="Confirmation" showBack={true} />

    <View style={styles.content}>
      <Ionicons name="checkmark-circle" size={100} color="#4CAF50" />
    <Text style={styles.statusText}>
  {details.type === "event" ? "Booking Confirmed" : "Membership Activated"}
</Text>

      <View style={styles.card}>
        <ImageBackground source={{ uri: details.image }} style={styles.image}>
          {/* Image overlay */}
          <LinearGradient
            colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.3)", "rgba(0,0,0,0.65)"]}
            locations={[0, 0.65, 0.85, 1]}
            start={{ x: 0.3, y: 0 }}
            end={{ x: 0.3, y: 1 }}
            style={styles.imageOverlay}
          />
          <Text style={styles.eventTitle}>{details.title}</Text>
          <Text style={styles.eventInfo}>
            {details.time}
            {"\n"}
            {details.location}
          </Text>
        </ImageBackground>
      </View>

      <View style={styles.detailsBox}>
        <View style={styles.detailRow}>
          <Text style={styles.detailRowText}>Ticket Type:</Text>
          <Text style={styles.detailRowText}>{details.ticketType}</Text>
         {details.type === "event" ? "Ticket Type:" : "Plan Type:"}
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailRowText}>Number of Ticket:</Text>
          <Text style={styles.detailRowText}>{details.ticketCount}</Text>
        {details.type === "event" ? "Number of Ticket:" : "Membership Count:"}
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailRowText}>Booking ID:</Text>
          <Text style={styles.detailRowText}>{details.bookingId}</Text>
        
         {details.type === "event" ? "Booking ID:" : "Membership ID:"}</View>
        <View style={[styles.detailRow, { marginTop: 10 }]}>
          <Text style={styles.detailRowText}>Total Cost:</Text>
          <Text style={styles.detailRowText}>{details.totalCost}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.mainBtn} onPress={onGoToBookings}>
        <Text style={styles.mainBtnText}> {details.type === "event" ? "My bookings" : "My membership"}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.secBtn} onPress={onViewDetails}>
        <Text style={styles.secBtnText}> {details.type === "event" ? "Event details" : "Membership details"}</Text>
      </TouchableOpacity>
    </View>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.textOnPrimary,
  },

  content: {
    flex: 1,
    alignItems: "center",
    padding: 20,
  },
  statusText: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.saveBtnTextColor,
    marginBottom: 25,
  },

  card: {
    width: "95%",
    height: 200,
    borderRadius: 15,
    overflow: "hidden",
    marginBottom: 10,
  },

  image: {
    height: "100%",
    width: "100%",
    justifyContent: "flex-end",
  },

  // Image overlay and is positioned absolutely
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
  },

  eventTitle: {
    marginLeft: 20,
    color: colors.textOnPrimary,
    fontWeight: "bold",
    fontSize: 16,
  },
  eventInfo: {
    marginLeft: 20,
    marginBottom: 10,
    color: colors.textOnPrimary,
    fontSize: 14,
  },
  detailsBox: {
    backgroundColor: "white",
    width: "95%",
    padding: 20,
    elevation: 2,
    borderRadius: 15,
    marginBottom: 25,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  detailRowText: {
    fontWeight: "600",
    fontSize: 16,
    color: colors.saveBtnTextColor,
  },
  mainBtn: {
    backgroundColor: colors.primary,
    width: "100%",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 12,
  },
  mainBtnText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 20,
  },
  secBtn: {
    backgroundColor: "white",
    width: "100%",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.textOnPrimary,
  },
  secBtnText: {
    color: colors.primary,
    fontWeight: "bold",
    fontSize: 20,
  },
});
