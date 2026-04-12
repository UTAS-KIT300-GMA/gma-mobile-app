import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const BRAND = "#9B4F72";
const PAGE_BG = "#F5F0EB";
const CARD_BG = "#FFFFFF";
const BORDER = "#E7D6DE";
const TEXT_DARK = "#4A1F36";
const MUTED = "#8A7A83";

type PaymentMethod = "card" | "apple" | "google" | "afterpay";

interface PaymentUIProps {
  type: string;
  title: string;
  price: string;
  ticketType: string;
  time: string;
  location: string;
  ticketCount: string;
  benefits: string;
  selectedMethod: PaymentMethod;
  cardHolderName: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
  afterpayContact: string;
  onSelectMethod: (method: PaymentMethod) => void;
  onChangeCardHolderName: (value: string) => void;
  onChangeCardNumber: (value: string) => void;
  onChangeExpiry: (value: string) => void;
  onChangeCvv: (value: string) => void;
  onChangeAfterpayContact: (value: string) => void;
  onConfirmPayment: () => void;
}

const detectCardType = (number: string): string => {
  const cleaned = number.replace(/\D/g, "");

  if (!cleaned) return "";

  if (/^4/.test(cleaned)) return "Visa";

  const firstTwo = parseInt(cleaned.slice(0, 2), 10);
  const firstFour = parseInt(cleaned.slice(0, 4), 10);

  if (
    (firstTwo >= 51 && firstTwo <= 55) ||
    (firstFour >= 2221 && firstFour <= 2720)
  ) {
    return "Mastercard";
  }

  return "Unknown card";
};

const getCardLogo = (number: string) => {
  const cleaned = number.replace(/\D/g, "");

  if (/^4/.test(cleaned)) {
    return require("../../../assets/images/visa.jpg");
  }

  const firstTwo = parseInt(cleaned.slice(0, 2), 10);
  const firstFour = parseInt(cleaned.slice(0, 4), 10);

  if (
    (firstTwo >= 51 && firstTwo <= 55) ||
    (firstFour >= 2221 && firstFour <= 2720)
  ) {
    return require("../../../assets/images/mastercard.jpg");
  }

  return null;
};

export function PaymentScreenUI({
  type,
  title,
  price,
  ticketType,
  time,
  location,
  ticketCount,
  benefits,
  selectedMethod,
  cardHolderName,
  cardNumber,
  expiry,
  cvv,
  afterpayContact,
  onSelectMethod,
  onChangeCardHolderName,
  onChangeCardNumber,
  onChangeExpiry,
  onChangeCvv,
  onChangeAfterpayContact,
  onConfirmPayment,
}: PaymentUIProps) {
  const cardType = detectCardType(cardNumber);
  const cardLogo = getCardLogo(cardNumber);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.summaryCard}>
          <Text style={styles.planTitle}>{title}</Text>
          <Text style={styles.planPrice}>
            {type === "membership" ? `$${price}/month` : `$${price}`}
          </Text>
          <Text style={styles.planType}>{ticketType}</Text>

          {type === "event" ? (
            <>
              {!!time && <Text style={styles.extraText}>{time}</Text>}
              {!!location && <Text style={styles.extraText}>{location}</Text>}
              <Text style={styles.extraText}>Tickets: {ticketCount}</Text>
            </>
          ) : (
            <>
              {benefits
                .split("|")
                .filter(Boolean)
                .map((item, index) => (
                  <Text key={index} style={styles.extraText}>
                    {item}
                  </Text>
                ))}
            </>
          )}
        </View>

        <View style={styles.paymentSection}>
          <View style={styles.headerWrap}>
            <Ionicons name="card-outline" size={24} color={BRAND} />
            <Text style={styles.heading}>Payment Method</Text>
          </View>

          <View style={styles.methodsCard}>
            <TouchableOpacity
              style={[
                styles.methodRow,
                selectedMethod === "card" && styles.methodRowSelected,
              ]}
              onPress={() => onSelectMethod("card")}
            >
              <View style={styles.methodLeft}>
                <View style={styles.radioOuter}>
                  {selectedMethod === "card" && <View style={styles.radioInner} />}
                </View>
                <Text style={styles.methodText}>Credit / Debit Card</Text>
              </View>
              <Text style={styles.payBadge}>Visa / MC</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.methodRow,
                selectedMethod === "apple" && styles.methodRowSelected,
              ]}
              onPress={() => onSelectMethod("apple")}
            >
              <View style={styles.methodLeft}>
                <View style={styles.radioOuter}>
                  {selectedMethod === "apple" && <View style={styles.radioInner} />}
                </View>
                <Text style={styles.methodText}>Apple Pay</Text>
              </View>
              <Image
                source={require("../../../assets/images/applepay.png")}
                style={styles.paymentMethodLogo}
                resizeMode="contain"
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.methodRow,
                selectedMethod === "google" && styles.methodRowSelected,
              ]}
              onPress={() => onSelectMethod("google")}
            >
              <View style={styles.methodLeft}>
                <View style={styles.radioOuter}>
                  {selectedMethod === "google" && <View style={styles.radioInner} />}
                </View>
                <Text style={styles.methodText}>Google Pay</Text>
              </View>
              <Image
                source={require("../../../assets/images/gpay.jpg")}
                style={styles.paymentMethodLogo}
                resizeMode="contain"
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.methodRow,
                selectedMethod === "afterpay" && styles.methodRowSelected,
              ]}
              onPress={() => onSelectMethod("afterpay")}
            >
              <View style={styles.methodLeft}>
                <View style={styles.radioOuter}>
                  {selectedMethod === "afterpay" && <View style={styles.radioInner} />}
                </View>
                <Text style={styles.methodText}>Afterpay</Text>
              </View>
              <Image
                source={require("../../../assets/images/afterpay.png")}
                style={styles.paymentMethodLogo}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>

          {selectedMethod === "card" && (
            <View style={styles.formCard}>
              {cardType ? (
                <View style={styles.cardTypeRow}>
                  <Text style={styles.cardTypeText}>Detected: {cardType}</Text>
                  {cardLogo && (
                    <Image
                      source={cardLogo}
                      style={styles.cardBrandLogo}
                      resizeMode="contain"
                    />
                  )}
                </View>
              ) : null}

              <TextInput
                placeholder="Cardholder name"
                placeholderTextColor="#B7AAB2"
                style={styles.input}
                value={cardHolderName}
                onChangeText={onChangeCardHolderName}
              />

              <TextInput
                placeholder="Card number"
                placeholderTextColor="#B7AAB2"
                style={styles.input}
                value={cardNumber}
                onChangeText={onChangeCardNumber}
                keyboardType="number-pad"
              />

              <View style={styles.rowInputs}>
                <TextInput
                  placeholder="Expiry MM/YY"
                  placeholderTextColor="#B7AAB2"
                  style={[styles.input, styles.halfInput]}
                  value={expiry}
                  onChangeText={onChangeExpiry}
                />

                <TextInput
                  placeholder="CVV"
                  placeholderTextColor="#B7AAB2"
                  style={[styles.input, styles.halfInput]}
                  value={cvv}
                  onChangeText={onChangeCvv}
                  keyboardType="number-pad"
                  secureTextEntry
                />
              </View>
            </View>
          )}

          {selectedMethod === "afterpay" && (
            <View style={styles.formCard}>
              <TextInput
                placeholder="Email or phone"
                placeholderTextColor="#B7AAB2"
                style={styles.input}
                value={afterpayContact}
                onChangeText={onChangeAfterpayContact}
                autoCapitalize="none"
              />
            </View>
          )}

          <TouchableOpacity style={styles.confirmBtn} onPress={onConfirmPayment}>
            <Text style={styles.confirmBtnText}>
              {type === "event" ? "Confirm booking" : "Confirm membership"}
            </Text>
          </TouchableOpacity>

          <Text style={styles.secureText}>
            Secure payment processed via payment provider
          </Text>
        </View>
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
    backgroundColor: "#F8F3F6",
    borderRadius: 18,
    padding: 18,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: BORDER,
  },
  planTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: TEXT_DARK,
    marginBottom: 4,
  },
  planPrice: {
    fontSize: 24,
    fontWeight: "800",
    color: BRAND,
    marginBottom: 4,
  },
  planType: {
    fontSize: 14,
    color: MUTED,
    marginBottom: 2,
  },
  extraText: {
    fontSize: 14,
    color: MUTED,
    marginTop: 4,
  },
  paymentSection: {
    backgroundColor: "transparent",
    borderRadius: 24,
    padding: 0,
  },
  headerWrap: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  heading: {
    marginTop: 6,
    fontSize: 18,
    fontWeight: "700",
    color: TEXT_DARK,
  },
  methodsCard: {
    backgroundColor: CARD_BG,
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
  },
  formCard: {
    backgroundColor: CARD_BG,
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
  },
  methodRow: {
    minHeight: 42,
    borderWidth: 1.5,
    borderColor: BRAND,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFDFE",
  },
  methodRowSelected: {
    backgroundColor: "#FAF2F7",
  },
  methodLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: BRAND,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  radioInner: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: BRAND,
  },
  methodText: {
    fontSize: 13.5,
    color: TEXT_DARK,
    fontWeight: "500",
  },
  payBadge: {
    fontSize: 14,
    color: TEXT_DARK,
    fontWeight: "700",
  },
  paymentMethodLogo: {
    width: 52,
    height: 22,
  },
  cardTypeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  cardTypeText: {
    fontSize: 14,
    fontWeight: "700",
    color: BRAND,
  },
  cardBrandLogo: {
    width: 46,
    height: 28,
  },
  input: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 14,
    fontSize: 14,
    color: TEXT_DARK,
    marginBottom: 12,
  },
  rowInputs: {
    flexDirection: "row",
    gap: 10,
  },
  halfInput: {
    flex: 1,
    minHeight: 52,
  },
  confirmBtn: {
    backgroundColor: BRAND,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 2,
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
});