import { PaymentScreenUI } from "@/screens/event/payment-UI";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert } from "react-native";

import { PaymentMethod } from "@/types/payment";

export default function PaymentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const paymentData = {
    type: String(params.type ?? "membership"),
    title: String(params.title ?? "Premium Plan"),
    price: String(params.price ?? "9.99"),
    ticketType: String(params.ticketType ?? "Membership"),
    image: String(params.image ?? ""),
    time: String(params.time ?? ""),
    location: String(params.location ?? ""),
    ticketCount: String(params.ticketCount ?? "1"),
    benefits: String(params.benefits ?? ""),
  };

const [selectedMethod, setSelectedMethod] =
  useState<PaymentMethod>("card");
const [cardHolderName, setCardHolderName] = useState("");
const [cardNumber, setCardNumber] = useState("");
const [expiry, setExpiry] = useState("");
const [cvv, setCvv] = useState("");
const [afterpayContact, setAfterpayContact] = useState("");

  const handlePayment = () => {
    if (selectedMethod === "card") {
      if (!cardHolderName ||!cardNumber || !expiry || !cvv) {
        return Alert.alert("Error", "Please fill in all card details.");
      }
    }
    if (selectedMethod === "afterpay") {
  if (!afterpayContact.trim()) {
    return Alert.alert("Error", "Please enter your email or phone for Afterpay.");
  }
}
    
    Alert.alert("Success", "Payment Successful!", [
      {
        text: "OK",
        onPress: () =>
          router.replace({
            pathname: "/event/confirmation",
            params: {
              title:paymentData.title,
              totalCost: `$${paymentData.price}`,
              ticketType:paymentData.ticketType,
              bookingId: `PAY-${Date.now()}`,
              time: paymentData.type === "event" ? paymentData.time : "Membership activated",
              location: paymentData.type === "event" ? location : "Digital membership",
              image:
                paymentData.type === "event"
                  ? paymentData.image
                  : "https://via.placeholder.com/600x400.png?text=Membership",
              ticketCount:paymentData.type === "event" ? paymentData.ticketCount : "1",
              type:paymentData.type,
              benefits:paymentData.benefits,
            },
          } as any),
      },
    ]);
  };

  return (
  <PaymentScreenUI
  type={paymentData.type}
  title={paymentData.title}
  price={paymentData.price}
  ticketType={paymentData.ticketType}
  time={paymentData.time}
  location={paymentData.location}
  ticketCount={paymentData.ticketCount}
  benefits={paymentData.benefits}
  selectedMethod={selectedMethod}
  cardHolderName={cardHolderName}
  cardNumber={cardNumber}
  expiry={expiry}
  cvv={cvv}
  onSelectMethod={setSelectedMethod}
  onChangeCardHolderName={setCardHolderName}
  onChangeCardNumber={setCardNumber}
  onChangeExpiry={setExpiry}
  onChangeCvv={setCvv}
  onConfirmPayment={handlePayment}
  afterpayContact={afterpayContact}
onChangeAfterpayContact={setAfterpayContact}
/>
  );
}