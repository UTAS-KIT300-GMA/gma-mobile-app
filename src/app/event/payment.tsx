import { PaymentScreenUI } from "@/screens/event/payment-UI";
import {
  STRIPE_CURRENCY,
  STRIPE_MERCHANT_COUNTRY,
  STRIPE_PUBLISHABLE_KEY,
} from "@/config/stripe";
import {
  priceStringToMinorUnits,
  requestPaymentIntentClientSecret,
} from "@/services/stripePaymentIntent";
import { auth, db } from "@/services/authService";
import { usePaymentSheet } from "@stripe/stripe-react-native";
import { addDoc, collection, serverTimestamp } from "@react-native-firebase/firestore";
import * as Linking from "expo-linking";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert } from "react-native";

function paymentIntentIdFromClientSecret(clientSecret: string): string {
  const idx = clientSecret.indexOf("_secret_");
  if (idx === -1) return "";
  return clientSecret.slice(0, idx);
}

/**
 * @summary Opens Stripe Payment Sheet for tickets or membership, then confirms booking for paid events.
 */
export default function PaymentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { initPaymentSheet, presentPaymentSheet } = usePaymentSheet();
  const [processing, setProcessing] = useState(false);

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
    eventId: String(params.eventId ?? ""),
    dietaryTagsJson: String(params.dietaryTags ?? "[]"),
    dietaryOtherSelected: String(params.dietaryOtherSelected ?? "0"),
    dietaryOtherNote: String(params.dietaryOtherNote ?? ""),
  };

  const handlePayment = async () => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Error", "You must be logged in to pay.");
      return;
    }

    if (!STRIPE_PUBLISHABLE_KEY) {
      Alert.alert(
        "Stripe not configured",
        "Set EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY in your environment.",
      );
      return;
    }

    const amountMinor = priceStringToMinorUnits(paymentData.price);
    if (amountMinor < 1) {
      Alert.alert("Error", "Invalid amount for checkout.");
      return;
    }

    setProcessing(true);
    try {
      const idToken = await user.getIdToken();
      const metadata: Record<string, string> = {
        checkoutType: paymentData.type,
        userId: user.uid,
      };
      if (paymentData.eventId) {
        metadata.eventId = paymentData.eventId;
      }
      metadata.ticketCount = paymentData.ticketCount;

      const intentResult = await requestPaymentIntentClientSecret(
        {
          amount: amountMinor,
          currency: STRIPE_CURRENCY,
          metadata,
        },
        idToken,
      );

      if ("error" in intentResult) {
        Alert.alert("Payment setup on App failed", intentResult.error);
        return;
      }

      const { clientSecret } = intentResult;
      const displayAmount = paymentData.price.replace(/[^0-9.]/g, "");

      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: "GMA Connect",
        paymentIntentClientSecret: clientSecret,
        returnURL: Linking.createURL("stripe-redirect"),
        applePay: {
          merchantCountryCode: STRIPE_MERCHANT_COUNTRY,
          cartItems: [
            {
              paymentType: "Immediate",
              label: paymentData.title.slice(0, 60),
              amount: displayAmount || "0.00",
            },
          ],
        },
        googlePay: {
          merchantCountryCode: STRIPE_MERCHANT_COUNTRY,
          currencyCode: STRIPE_CURRENCY.toUpperCase(),
          testEnv: __DEV__,
        },
      });

      if (initError) {
        Alert.alert("Checkout error", initError.message);
        return;
      }

      const { error: presentError } = await presentPaymentSheet();

      if (presentError) {
        if (presentError.code === "Canceled") {
          return;
        }
        Alert.alert("Payment failed", presentError.message);
        return;
      }

      const stripePaymentIntentId = paymentIntentIdFromClientSecret(clientSecret);
      let bookingId = stripePaymentIntentId || `PAY-${Date.now()}`;

      if (paymentData.type === "event" && paymentData.eventId) {
        let dietaryTags: string[] = [];
        try {
          dietaryTags = JSON.parse(paymentData.dietaryTagsJson) as string[];
          if (!Array.isArray(dietaryTags)) dietaryTags = [];
        } catch {
          dietaryTags = [];
        }
        const dietaryOtherSelected = paymentData.dietaryOtherSelected === "1";
        const otherTrim = paymentData.dietaryOtherNote.trim();
        const summaryParts: string[] = [...dietaryTags];
        if (dietaryOtherSelected) {
          summaryParts.push(otherTrim ? `Other: ${otherTrim}` : "Other");
        }
        const dietarySummary = summaryParts.length ? summaryParts.join(", ") : "";

        const dietaryFields: Record<string, unknown> = {};
        if (dietaryTags.length) dietaryFields.dietaryTags = [...dietaryTags];
        if (dietaryOtherSelected && otherTrim) {
          dietaryFields.dietaryOtherNote = otherTrim;
        }
        if (dietarySummary) dietaryFields.dietaryRequirements = dietarySummary;

        const userBookingsRef = collection(db, "users", user.uid, "bookings");
        const docRef = await addDoc(userBookingsRef, {
          eventId: paymentData.eventId,
          eventTitle: paymentData.title,
          ticketCount: Number.parseInt(paymentData.ticketCount, 10) || 1,
          totalPaid: amountMinor / 100,
          status: "confirmed",
          paymentProvider: "stripe",
          stripePaymentIntentId: stripePaymentIntentId || null,
          createdAt: serverTimestamp(),
          ...(Object.keys(dietaryFields).length ? dietaryFields : {}),
          event: {
            title: paymentData.title,
            image: paymentData.image,
            dateTime: paymentData.time,
            address: paymentData.location,
          },
        });
        bookingId = docRef.id;
      }

      router.replace({
        pathname: "/event/confirmation",
        params: {
          title: paymentData.title,
          totalCost: `$${Number.parseFloat(paymentData.price.replace(/[^0-9.]/g, "")).toFixed(2)}`,
          ticketType: paymentData.ticketType,
          bookingId,
          time:
            paymentData.type === "event"
              ? paymentData.time
              : "Membership activated",
          location:
            paymentData.type === "event"
              ? paymentData.location
              : "Digital membership",
          image:
            paymentData.type === "event"
              ? paymentData.image
              : "https://via.placeholder.com/600x400.png?text=Membership",
          ticketCount:
            paymentData.type === "event" ? paymentData.ticketCount : "1",
          type: paymentData.type,
          benefits: paymentData.benefits,
          eventId: paymentData.eventId,
        },
      } as any);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong.";
      Alert.alert("Payment error", msg);
    } finally {
      setProcessing(false);
    }
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
      processing={processing}
      onConfirmPayment={handlePayment}
    />
  );
}
