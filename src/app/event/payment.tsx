import { PaymentScreenUI } from "@/screens/event/payment-UI";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert } from "react-native";

import { PaymentMethod } from "@/types/payment";

export default function PaymentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const type = String(params.type ?? "membership");
  const title = String(params.title ?? "Premium Plan");
  const price = String(params.price ?? "9.99");
  const ticketType = String(params.ticketType ?? "Membership");
  const image = String(params.image ?? "");
  const time = String(params.time ?? "");
  const location = String(params.location ?? "");
  const ticketCount = String(params.ticketCount ?? "1");
  const benefits = String(params.benefits ?? "");

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
              title,
              totalCost: `$${price}`,
              ticketType,
              bookingId: `PAY-${Date.now()}`,
              time: type === "event" ? time : "Membership activated",
              location: type === "event" ? location : "Digital membership",
              image:
                type === "event"
                  ? image
                  : "https://via.placeholder.com/600x400.png?text=Membership",
              ticketCount: type === "event" ? ticketCount : "1",
              type,
              benefits,
            },
          } as any),
      },
    ]);
  };

  return (
  <PaymentScreenUI
  type={type}
  title={title}
  price={price}
  ticketType={ticketType}
  time={time}
  location={location}
  ticketCount={ticketCount}
  benefits={benefits}
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