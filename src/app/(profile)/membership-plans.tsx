import { AppHeader } from "@/components/AppHeader";
import { auth, db, doc, serverTimestamp, updateDoc } from "@/services/authService";
import { colors } from "@/theme/ThemeProvider";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {ErrorCode, getAvailablePurchases, useIAP} from "react-native-iap";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type BillingOfferOption = {
  productId: string;
  title: string;
  description: string;
  displayPrice: string;
  durationLabel: string;
  offerToken?: string;
  offerId?: string;
  basePlanId?: string;
  tags: string[];
};

const MEMBERSHIP_SUBSCRIPTION_SKUS = [
  process.env.EXPO_PUBLIC_PLAY_SUBSCRIPTION_MONTHLY_SKU,
  process.env.EXPO_PUBLIC_PLAY_SUBSCRIPTION_YEARLY_SKU,
  process.env.EXPO_PUBLIC_PLAY_SUBSCRIPTION_PREPAID_SKU,
].filter((value): value is string => !!value?.trim());

export default function MembershipPlansScreen() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<"free" | "premium">("premium");
  const [buying, setBuying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedOptionKey, setSelectedOptionKey] = useState<string>("");

  const { connected, subscriptions, fetchProducts, requestPurchase, finishTransaction, availablePurchases } =
    useIAP({
      onPurchaseSuccess: async (purchase) => {
        try {
          const uid = auth.currentUser?.uid;
          if (uid) {
            await updateDoc(doc(db, "users", uid), {
              role: "member",
              membershipStatus: "active",
              membershipProvider: "google_play",
              membershipSku: String(purchase?.productId ?? ""),
              membershipPurchaseToken: String(
                purchase?.purchaseToken ?? purchase?.transactionId ?? "",
              ),
              membershipUpdatedAt: serverTimestamp(),
            });
          }
          await finishTransaction({ purchase, isConsumable: false } as any);
          Alert.alert("Membership activated", "Your premium access is now active.", [
            { text: "OK", onPress: () => router.replace("/(profile)/membership" as any) },
          ]);
        } catch (e) {
          const message =
            e instanceof Error ? e.message : "Failed to activate your membership.";
          Alert.alert("Purchase error", message);
        } finally {
          setBuying(false);
        }
      },
      onPurchaseError: (error) => {
        const code = String(error?.code ?? "");
        const cancelled =
          code === ErrorCode.UserCancelled ||
          code === "E_USER_CANCELLED" ||
          code === "user-cancelled";
        if (!cancelled) {
          Alert.alert("Purchase error", String(error?.message ?? "Purchase failed."));
        }
        setBuying(false);
      },
      onError: (error) => {
        Alert.alert("Billing unavailable", error.message);
        setLoading(false);
      },
    });

  const options = useMemo<BillingOfferOption[]>(() => {
    const normalized: BillingOfferOption[] = [];
    subscriptions.forEach((sub: any) => {
      const productId = String(sub?.id ?? sub?.productId ?? "");
      if (!productId) return;
      const title = String(sub?.title ?? "GMA Premium").replace(/\s+\(.*\)$/, "").trim();
      const description = String(sub?.description ?? "");
      const offerDetails = Array.isArray(sub?.subscriptionOfferDetailsAndroid)
        ? sub.subscriptionOfferDetailsAndroid
        : [];

      if (!offerDetails.length) {
        normalized.push({
          productId,
          title,
          description,
          displayPrice: String(sub?.displayPrice ?? sub?.localizedPrice ?? "Check Play Store"),
          durationLabel: "Standard",
          tags: [],
        });
        return;
      }

      offerDetails.forEach((offer: any) => {
        const phases = Array.isArray(offer?.pricingPhases?.pricingPhaseList)
          ? offer.pricingPhases.pricingPhaseList
          : [];
        const firstPhase = phases[0] ?? {};
        normalized.push({
          productId,
          title,
          description,
          displayPrice: String(firstPhase?.formattedPrice ?? "Check Play Store"),
          durationLabel: String(firstPhase?.billingPeriod ?? "Subscription"),
          offerToken: offer?.offerToken ? String(offer.offerToken) : undefined,
          offerId: offer?.offerId ? String(offer.offerId) : undefined,
          basePlanId: offer?.basePlanId ? String(offer.basePlanId) : undefined,
          tags: Array.isArray(offer?.offerTags)
            ? offer.offerTags.map((tag: unknown) => String(tag))
            : [],
        });
      });
    });
    return normalized;
  }, [subscriptions]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!connected) return;
      try {
        await fetchProducts({
          skus: MEMBERSHIP_SUBSCRIPTION_SKUS,
          type: "subs",
        });
      } catch (e) {
        const message =
          e instanceof Error ? e.message : "Unable to load Play subscription plans.";
        Alert.alert("Billing unavailable", message);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    void load();
    return () => {
      mounted = false;
    };
  }, [connected, fetchProducts]);

  useEffect(() => {
    if (!options.length || selectedOptionKey) return;
    const first = options[0];
    setSelectedOptionKey(`${first.productId}::${first.offerToken ?? "standard"}`);
  }, [options, selectedOptionKey]);

  const selectedOption = useMemo(
    () =>
      options.find(
        (option) =>
          `${option.productId}::${option.offerToken ?? "standard"}` ===
          selectedOptionKey,
      ),
    [options, selectedOptionKey],
  );

  const handleSubscribe = async () => {
    if (selectedPlan === "free") {
      try {
        const uid = auth.currentUser?.uid;
        if (uid) {
          await updateDoc(doc(db, "users", uid), {
            role: "general",
            membershipStatus: "inactive",
            membershipUpdatedAt: serverTimestamp(),
          });
        }
        Alert.alert("Free plan", "You are now using the free tier.");
        router.replace("/(profile)/membership" as any);
      } catch (e) {
        const message =
          e instanceof Error ? e.message : "Unable to switch to the free plan.";
        Alert.alert("Update failed", message);
      }
      return;
    }

    if (!selectedOption) {
      Alert.alert(
        "No plan selected",
        "No Play Billing plan is available yet. Configure subscription products in Google Play Console and app env SKU values.",
      );
      return;
    }

    setBuying(true);
    try {
      // Check if the user already owns this SKU on Google Play
      const purchases = await getAvailablePurchases();
      const existingPurchase = purchases.find(
          (p) => p.productId === selectedOption.productId
      );

      if (existingPurchase) {
        console.log("Found existing active purchase, restoring access...");

        const uid = auth.currentUser?.uid;
        if (uid) {
          await updateDoc(doc(db, "users", uid), {
            role: "member",
            membershipStatus: "active",
            membershipProvider: "google_play",
            membershipSku: existingPurchase.productId,
            membershipPurchaseToken: existingPurchase.purchaseToken,
            membershipUpdatedAt: serverTimestamp(),
          });
        }

        await finishTransaction({ purchase: existingPurchase, isConsumable: false } as any);

        Alert.alert("Access Restored", "We found an active subscription. Your premium access is restored.");
        router.replace("/(profile)/membership" as any);
        setBuying(false);
        return; // Exit here, do not call requestPurchase
      }

      await requestPurchase({
        request: {
          apple: { sku: selectedOption.productId },
          google: {
            skus: [selectedOption.productId],
            ...(selectedOption.offerToken
              ? {
                  subscriptionOffers: [
                    {
                      sku: selectedOption.productId,
                      offerToken: selectedOption.offerToken,
                    },
                  ],
                }
              : {}),
          },
        } as any,
        type: "subs",
      });
    } catch (e) {
      setBuying(false);
      const message = e instanceof Error ? e.message : "Unable to start purchase flow.";
      Alert.alert("Checkout failed", message);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader
        title="Membership Plans"
        showBack={true}
        onPressBack={() => router.back()}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <Pressable
          style={[
            styles.planCard,
            selectedPlan === "free" && styles.selectedCard,
          ]}
          onPress={() => setSelectedPlan("free")}
        >
          <Text style={styles.planName}>Free Plan</Text>
          <Text style={styles.planPrice}>Free</Text>
          <Text style={styles.planDesc}>Browse events</Text>
          <Text style={styles.planDesc}>RSVP to events</Text>
          <Text style={styles.planDesc}>Access learning content</Text>
        </Pressable>

        <Pressable
          style={[
            styles.planCard,
            selectedPlan === "premium" && styles.selectedCard,
          ]}
          onPress={() => setSelectedPlan("premium")}
        >
          <View style={styles.planHeader}>
            <Text style={styles.planName}>Premium Plan (Google Play)</Text>
          </View>

          <Text style={styles.planDesc}>Early access to selected events</Text>
          <Text style={styles.planDesc}>Event discounts</Text>
          <Text style={styles.planDesc}>Priority booking</Text>
          <Text style={styles.planDesc}>Exclusive content</Text>

          {loading ? (
            <View style={styles.loaderWrap}>
              <ActivityIndicator color={colors.primary} />
              <Text style={styles.planDesc}>
                {connected
                  ? "Loading available subscriptions..."
                  : "Connecting to Google Play Billing..."}
              </Text>
            </View>
          ) : (
            <View style={styles.offerList}>
              {options.map((option) => {
                const key = `${option.productId}::${option.offerToken ?? "standard"}`;
                const active = key === selectedOptionKey;
                const tagsLabel = option.tags.length ? ` • ${option.tags.join(", ")}` : "";
                return (
                  <Pressable
                    key={key}
                    style={[styles.offerCard, active && styles.offerCardActive]}
                    onPress={() => {
                      setSelectedPlan("premium");
                      setSelectedOptionKey(key);
                    }}
                  >
                    <Text style={styles.offerTitle}>{option.title}</Text>
                    <Text style={styles.offerMeta}>
                      {option.displayPrice} • {option.durationLabel}
                      {tagsLabel}
                    </Text>
                  </Pressable>
                );
              })}
              {!options.length && (
                <Text style={styles.planDesc}>
                  No Play subscription products returned yet.
                </Text>
              )}
            </View>
          )}
        </Pressable>

        <Pressable
          style={[styles.subscribeButton, buying && { opacity: 0.65 }]}
          onPress={handleSubscribe}
          disabled={buying}
        >
          <Text style={styles.subscribeText}>
            {selectedPlan === "premium"
              ? buying
                ? "Opening Google Play..."
                : "Subscribe with Google Play"
              : "Switch to Free Plan"}
          </Text>
        </Pressable>

        <Pressable
          onPress={() =>
            Alert.alert(
              "Plan Details",
              "Premium gives you early access, discounts, and priority booking.",
            )
          }
        >
          <Text style={styles.learnMore}>Learn more</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#f7f7f7",
  },
  content: {
    padding: 20,
  },
  planCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  planHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  planName: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.primary,
  },
  loaderWrap: {
    marginTop: 10,
    gap: 8,
  },
  offerList: {
    marginTop: 12,
    gap: 8,
  },
  offerCard: {
    borderWidth: 1,
    borderColor: "#d7d7d7",
    borderRadius: 10,
    padding: 10,
    backgroundColor: "#fff",
  },
  offerCardActive: {
    borderColor: colors.primary,
    backgroundColor: "#f4f7ff",
  },
  offerTitle: {
    fontWeight: "700",
    fontSize: 14,
    color: colors.primary,
  },
  offerMeta: {
    marginTop: 4,
    color: "#333",
    fontSize: 13,
  },
  planPrice: {
    marginTop: 6,
    fontSize: 16,
    fontWeight: "600",
  },
  planDesc: {
    marginTop: 4,
    fontSize: 14,
    color: "#333",
  },
  subscribeButton: {
    marginTop: 20,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  subscribeText: {
    color: "#fff",
    fontWeight: "700",
  },
  learnMore: {
    marginTop: 12,
    textAlign: "center",
    color: colors.primary,
    textDecorationLine: "underline",
  },
});
