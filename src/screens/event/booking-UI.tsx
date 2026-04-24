import { AppHeader } from "@/components/AppHeader";
import { formatDateTime } from "@/components/utils";
import { colors } from "@/theme/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
    ActivityIndicator,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export interface BookingUIProps {
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

/**
 * @summary Renders booking checkout UI with ticket controls and total pricing.
 * @param event - Event payload shown in booking summary.
 * @param loading - Loading state for event hydration.
 * @param processing - Submission state while booking is being saved.
 * @param tickets - Current ticket count.
 * @param totalPrice - Computed total price value.
 * @param onBack - Back navigation callback.
 * @param onIncreaseTickets - Increment ticket callback.
 * @param onDecreaseTickets - Decrement ticket callback.
 * @param onConfirm - Confirm booking callback.
 * @throws {never} UI delegates actions to callbacks.
 * @Returns {React.JSX.Element} Booking checkout screen.
 */
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
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const memberPrice = event.ticketPrices?.member ?? 0;
  const nonMemberPrice = event.ticketPrices?.nonMember ?? 0;
  const isFreeEvent = memberPrice === 0 && nonMemberPrice === 0;

  /**
   * @summary Builds the display text for event pricing tiers.
   * @throws {never} Pure formatter does not throw.
   * @Returns {string} Human-readable price label.
   */
  const getPriceLabel = () => {
    if (isFreeEvent) {
      return "Free Event";
    }

    return `Member: $${memberPrice} • Non-member: $${nonMemberPrice}`;
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <AppHeader title="Checkout" showBack onPressBack={onBack} />

      <View style={styles.container}>
        {/* Event Summary Card */}
        <View style={styles.summaryCard}>
          <Image
            source={{ uri: event.image || "https://via.placeholder.com/150" }}
            style={styles.image}
          />
          <View style={styles.summaryText}>
            <Text style={styles.title} numberOfLines={2}>
              {event.title}
            </Text>
            <Text style={styles.subText}>
              {event.dateTime ? formatDateTime(event.dateTime) : "Date TBD"}
            </Text>
            <Text style={styles.subText}>
              {event.address || "Location TBD"}
            </Text>
            <Text style={styles.priceText}>{getPriceLabel()}</Text>
          </View>
        </View>

        {/* Ticket Counter */}
        <View style={styles.counterSection}>
          <Text style={styles.sectionTitle}>Number of Tickets</Text>
          <View style={styles.counterRow}>
            <TouchableOpacity
              style={styles.circleBtn}
              onPress={onDecreaseTickets}
            >
              <Ionicons name="remove" size={24} color={colors.primary} />
            </TouchableOpacity>

            <Text style={styles.ticketCount}>{tickets}</Text>

            <TouchableOpacity
              style={styles.circleBtn}
              onPress={onIncreaseTickets}
            >
              <Ionicons name="add" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Total Price */}
        <View style={styles.totalSection}>
          <Text style={styles.totalLabel}>Total Price</Text>
          <Text style={styles.totalAmount}>
            {isFreeEvent ? "Free" : `$${totalPrice.toFixed(2)}`}
          </Text>
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
  safe: {
    flex: 1,
    backgroundColor: colors.textOnPrimary,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
    padding: 20,
  },
  summaryCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.textOnPrimary,
    borderRadius: 15,
    padding: 15,
    marginBottom: 30,
    elevation: 1,
  },
  image: {
    width: 100,
    height: 120,
    borderRadius: 10,
    marginRight: 15,
  },
  summaryText: {
    flex: 1,
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.saveBtnTextColor,
    marginBottom: 5,
  },
  subText: {
    color: colors.saveBtnTextColor,
    marginBottom: 5,
  },
  priceText: {
    color: colors.primary,
    fontWeight: "bold",
  },
  counterSection: {
    backgroundColor: colors.textOnPrimary,
    borderRadius: 15,
    padding: 20,
    elevation: 1,
    alignItems: "center",
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    color: colors.saveBtnTextColor,
    fontWeight: "bold",
    marginBottom: 15,
  },
  counterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  circleBtn: {
    width: 45,
    height: 45,
    borderRadius: 25,
    backgroundColor: colors.lightGrey,
    justifyContent: "center",
    alignItems: "center",
  },
  ticketCount: {
    fontSize: 24,
    fontWeight: "bold",
    width: 40,
    textAlign: "center",
  },
  totalSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.textOnPrimary,
    elevation: 1,
    padding: 20,
    borderRadius: 15,
  },
  totalLabel: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.saveBtnTextColor,
  },
  totalAmount: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.primary,
  },
  bottomBar: {
    padding: 20,
    backgroundColor: colors.textOnPrimary,
    borderTopWidth: 1,
    borderColor: colors.textOnPrimary,
  },
  confirmBtn: {
    backgroundColor: colors.secondary,
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 40,
  },
  confirmBtnText: {
    color: colors.textOnPrimary,
    fontSize: 20,
    fontWeight: "bold",
  },
});
