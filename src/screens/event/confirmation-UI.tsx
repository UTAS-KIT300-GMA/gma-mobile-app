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

/**
 * @summary Renders booking or membership confirmation details and post-action navigation buttons.
 * @param details - Normalized confirmation payload (event or membership).
 * @param onGoToBookings - Callback for opening bookings/membership destination.
 * @param onViewDetails - Callback for opening event details or explore flow.
 * @throws {never} UI delegates actions to parent callbacks.
 * @Returns {React.JSX.Element} Confirmation screen content.
 */
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
    {details.type === "event" &&(
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
      )}

{details.type === "membership" && (
  <View style={styles.card}>
    <View style={styles.membershipCard}>
      <Text style={styles.membershipTitle}>{details.title}</Text>
      <Text style={styles.membershipPrice}>{details.totalCost}/month</Text>

      <Text style={styles.membershipBenefit}>Early access to selected events</Text>
      <Text style={styles.membershipBenefit}>Event discounts</Text>
      <Text style={styles.membershipBenefit}>Priority booking</Text>
      <Text style={styles.membershipBenefit}>Exclusive content</Text>
    </View>
  </View>
)}
  {details.type === "event" && (
      <View style={styles.detailsBox}>
        <View style={styles.detailRow}>
          <Text style={styles.detailRowText}>Ticket Type:</Text>
          <Text style={styles.detailRowText}>{details.ticketType}</Text>
          <Text style={styles.detailRowText}>Ticket Type</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailRowText}>Number of Ticket:</Text>
          <Text style={styles.detailRowText}>{details.ticketCount}</Text>
          <Text style={styles.detailRowText}>Number of Ticket:</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailRowText}>Booking ID:</Text>
          <Text style={styles.detailRowText}>{details.bookingId}</Text>
          <Text style={styles.detailRowText}>Booking ID:</Text>
        </View>
        <View style={[styles.detailRow, { marginTop: 10 }]}>
          <Text style={styles.detailRowText}>Total Cost:</Text>
          <Text style={styles.detailRowText}>{details.totalCost}</Text>
        </View>
      </View>
  )}    

  {details.type === "membership" && (
  <View style={styles.detailsBox}>
    <View style={styles.detailRow}>
      <Text style={styles.detailRowText}>Ticket Type:</Text>
      <Text style={styles.detailRowText}>Membership</Text>
    </View>

    <View style={styles.detailRow}>
      <Text style={styles.detailRowText}>Booking ID:</Text>
      <Text style={styles.detailRowText}>{details.bookingId}</Text>
    </View>

    <View style={[styles.detailRow, { marginTop: 10 }]}>
      <Text style={styles.detailRowText}>Total Cost:</Text>
      <Text style={styles.detailRowText}>{details.totalCost}</Text>
    </View>
  </View>
)}

      <TouchableOpacity style={styles.mainBtn} onPress={onGoToBookings}>
        <Text style={styles.mainBtnText}> {details.type === "event" ? "My bookings" : "My membership"}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.secBtn} onPress={onViewDetails}>
        <Text style={styles.secBtnText}> {details.type === "event" ? "Event details" : "Explore More"}</Text>
      </TouchableOpacity>
    </View>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F7F2F5"
  },
 membershipCard: {
  backgroundColor: colors.textOnPrimary,
  width: "100%",
  padding: 20,
  borderRadius: 15,
  marginBottom: 15,
  elevation: 2, // Android shadow
  shadowColor: "#000", // iOS shadow
  shadowOpacity: 0.05,
  shadowOffset: { width: 0, height: 2 },
  shadowRadius: 6,
  alignSelf: "center"
},

membershipTitle: {
  fontSize: 18,
  fontWeight: "700",
  color: colors.saveBtnTextColor,
  marginBottom: 1,
},

membershipPrice: {
  fontSize: 20,
  fontWeight: "bold",
  color: colors.primary,
  marginBottom: 10,
},

membershipBenefit: {
  fontSize: 16,
  fontWeight: "500",
  color: "#be5c94",
  marginTop: 2,
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
  membershipDetailsBox: {
  backgroundColor: "white",
  width: "95%",
  padding: 20,
  elevation: 2,
  borderRadius: 15,
  marginBottom: 25,
},

membershipDetailRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 14,
},

membershipDetailLabel: {
  fontWeight: "600",
  fontSize: 16,
  color: colors.saveBtnTextColor,
},

membershipDetailValue: {
  fontWeight: "600",
  fontSize: 16,
  color: colors.saveBtnTextColor,
  maxWidth: "55%",
  textAlign: "right",
},
});
