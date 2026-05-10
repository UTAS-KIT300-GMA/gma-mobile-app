import React from "react";
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";

const BRAND = "#9B4F72";
const PAGE_BG = "#F5F0EB";
const CARD_BG = "#FFFFFF";
const BORDER = "#E7D6DE";
const TEXT_DARK = "#4A1F36";
const MUTED = "#8A7A83";

export interface PaymentUIProps {
  type: string;
  title: string;
  price: string;
  ticketType: string;
  time: string;
  location: string;
  ticketCount: string;
  benefits: string;
  processing: boolean;
  onConfirmPayment: () => void;
}

/**
 * @summary Order summary and Stripe checkout trigger for event tickets or membership.
 */
export function PaymentScreenUI({
  type,
  title,
  price,
  ticketType,
  time,
  location,
  ticketCount,
  benefits,
  processing,
  onConfirmPayment,
}: PaymentUIProps) {
  const benefitLines = benefits
    ? benefits.split("|").filter((s) => s.trim().length > 0)
    : [];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>{title}</Text>
          {type === "event" ? (
            <>
              <Text style={styles.summaryLine}>{time}</Text>
              <Text style={styles.summaryLine}>{location}</Text>
              <Text style={styles.summaryLine}>
                {ticketCount} × {ticketType}
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.summaryLine}>{ticketType}</Text>
              {benefitLines.map((line) => (
                <Text key={line} style={styles.benefitLine}>
                  • {line.trim()}
                </Text>
              ))}
            </>
          )}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>${price}</Text>
          </View>
        </View>

        <View style={styles.methodsCard}>
          <Text style={styles.heading}>Secure checkout</Text>
          <Text style={styles.helperText}>
            You will complete payment in Stripe&apos;s sheet. Cards, Apple Pay,
            and Google Pay appear when your device and account support them.
          </Text>
          <View style={styles.logoRow}>
            <Image
              source={require("../../../assets/images/visa.jpg")}
              style={styles.cardOptionLogo}
              resizeMode="contain"
            />
            <Image
              source={require("../../../assets/images/mastercard.jpg")}
              style={styles.cardOptionLogo}
              resizeMode="contain"
            />
            <Image
              source={require("../../../assets/images/applepay.png")}
              style={styles.paymentMethodLogo}
              resizeMode="contain"
            />
            <Image
              source={require("../../../assets/images/gpay.jpg")}
              style={styles.paymentMethodLogo}
              resizeMode="contain"
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.confirmBtn, processing && styles.confirmBtnDisabled]}
          onPress={onConfirmPayment}
          disabled={processing}
        >
          {processing ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.confirmBtnText}>Pay with Stripe</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.secureText}>
          Payments are processed by Stripe. We do not store your full card
          details on this device.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: PAGE_BG,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 32,
  },
  summaryCard: {
    backgroundColor: CARD_BG,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: BORDER,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: TEXT_DARK,
    marginBottom: 8,
  },
  summaryLine: {
    fontSize: 14,
    color: MUTED,
    marginBottom: 4,
  },
  benefitLine: {
    fontSize: 14,
    color: TEXT_DARK,
    marginBottom: 2,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: BORDER,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: TEXT_DARK,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: "700",
    color: BRAND,
  },
  heading: {
    marginTop: 6,
    fontSize: 20,
    marginBottom: 8,
    fontWeight: "700",
    color: TEXT_DARK,
  },
  helperText: {
    fontSize: 13,
    color: MUTED,
    lineHeight: 18,
    marginBottom: 12,
  },
  methodsCard: {
    backgroundColor: CARD_BG,
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  confirmBtn: {
    backgroundColor: BRAND,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 2,
  },
  confirmBtnDisabled: {
    opacity: 0.75,
  },
  confirmBtnText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  secureText: {
    marginTop: 12,
    textAlign: "center",
    fontSize: 10,
    color: MUTED,
  },
  paymentMethodLogo: {
    width: 52,
    height: 22,
  },
  cardOptionLogo: {
    width: 40,
    height: 24,
  },
});
