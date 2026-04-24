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
}: any) => {
  const renderDetailRow = (label: string, value: string | number) => (
    <View style={styles.detailRow} key={label}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader title="Confirmation" showBack={true} />

      <View style={styles.content}>
        <Ionicons name="checkmark-circle" size={96} color="#4CAF50" />
        <Text style={styles.statusText}>
          {details.type === "event" ? "Booking Confirmed" : "Membership Activated"}
        </Text>

        {details.type === "event" && (
          <View style={styles.card}>
            <ImageBackground source={{ uri: details.image }} style={styles.image}>
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
          <View style={styles.membershipCardContainer}>
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
            {renderDetailRow("Booking ID", details.bookingId)}
            {renderDetailRow("Ticket Type", details.ticketType)}
            {renderDetailRow("Number of Tickets", details.ticketCount)}
            {renderDetailRow("Total Cost", details.totalCost)}
          </View>
        )}

        {details.type === "membership" && (
          <View style={styles.detailsBox}>
            {renderDetailRow("Booking ID", details.bookingId)}
            {renderDetailRow("Ticket Type", "Membership")}
            {renderDetailRow("Total Cost", details.totalCost)}
          </View>
        )}

        <TouchableOpacity style={styles.mainBtn} onPress={onGoToBookings}>
          <Text style={styles.mainBtnText}>
            {details.type === "event" ? "My Bookings" : "My Membership"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secBtn} onPress={onViewDetails}>
          <Text style={styles.secBtnText}>
            {details.type === "event" ? "Event Details" : "Explore More"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

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
  marginBottom: 4,
},

membershipPrice: {
  fontSize: 20,
  fontWeight: "bold",
  color: colors.primary,
  marginBottom: 12,
},

membershipBenefit: {
  fontSize: 15,
  fontWeight: "500",
  color: "#be5c94",
  marginTop: 3,
},
membershipCardContainer: {
  width: "95%",
  marginBottom: 12,
},

  content: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 20,
  },
  statusText: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.saveBtnTextColor,
    marginTop: 10,
    marginBottom: 16,
  },

  card: {
    width: "95%",
    height: 200,
    borderRadius: 15,
    overflow: "hidden",
    marginBottom: 12,
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
    alignItems: "center",
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#F1E7EF",
  },
  detailLabel: {
    fontWeight: "600",
    fontSize: 15,
    color: colors.saveBtnTextColor,
    opacity: 0.8,
    paddingRight: 8,
  },
  detailValue: {
    fontWeight: "700",
    fontSize: 15,
    color: colors.saveBtnTextColor,
    flexShrink: 1,
    textAlign: "right",
  },
  mainBtn: {
    backgroundColor: colors.primary,
    width: "95%",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 12,
  },
  mainBtnText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 17,
  },
  secBtn: {
    backgroundColor: "white",
    width: "95%",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    elevation: 2,
    borderWidth: 1,
    borderColor: "#EADBE4",
  },
  secBtnText: {
    color: colors.primary,
    fontWeight: "bold",
    fontSize: 17,
  },
});
