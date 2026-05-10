import { AppHeader } from "@/components/AppHeader";
import { auth, db, doc, serverTimestamp, updateDoc } from "@/services/authService";
import {
  BillingOfferOption,
  buyMembershipOption,
  closeBillingConnection,
  fetchMembershipOfferOptions,
  initBillingConnection,
  startMembershipPurchaseListeners,
} from "@/services/membershipBilling";
import { colors } from "@/theme/ThemeProvider";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
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

/**
 * @summary Displays available membership plans and starts subscription checkout.
 * @throws {never} User actions are handled by navigation/alerts.
 * @Returns {React.JSX.Element} Membership plan selection screen.
 */
export default function MembershipPlansScreen() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<"free" | "premium">("premium");
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);
  const [options, setOptions] = useState<BillingOfferOption[]>([]);
  const [selectedOptionKey, setSelectedOptionKey] = useState<string>("");

  useEffect(() => {
    let mounted = true;
    let stopListeners: (() => void) | null = null;
    const setup = async () => {
      try {
        await initBillingConnection();
        stopListeners = startMembershipPurchaseListeners(
          () => {
            setBuying(false);
            Alert.alert("Membership activated", "Your premium access is now active.", [
              { text: "OK", onPress: () => router.replace("/(profile)/membership" as any) },
            ]);
          },
          (message) => {
            setBuying(false);
            Alert.alert("Purchase error", message);
          },
        );
        const loadedOptions = await fetchMembershipOfferOptions();
        if (!mounted) return;
        setOptions(loadedOptions);
        if (loadedOptions.length > 0) {
          const first = loadedOptions[0];
          setSelectedOptionKey(
            `${first.productId}::${first.offerToken ?? "standard"}`,
          );
        }
      } catch (e) {
        const message =
          e instanceof Error ? e.message : "Unable to load Play subscription plans.";
        Alert.alert("Billing unavailable", message);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    void setup();
    return () => {
      mounted = false;
      stopListeners?.();
      closeBillingConnection();
    };
  }, [router]);

  const selectedOption = useMemo(
    () =>
      options.find(
        (option) =>
          `${option.productId}::${option.offerToken ?? "standard"}` ===
          selectedOptionKey,
      ),
    [options, selectedOptionKey],
  );

/**
 * @summary Navigates to payment with the selected membership payload.
 * @throws {never} Navigation call does not throw synchronously.
 * @Returns {void} Opens payment route.
 */
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
    await buyMembershipOption(selectedOption);
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
        {/* Free Plan */}
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

        {/* Premium Plan */}
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
              <Text style={styles.planDesc}>Loading available subscriptions...</Text>
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

        {/* Subscribe Button */}
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

        {/* Learn More */}
        <Pressable
          onPress={() =>
            Alert.alert(
              "Plan Details",
              "Premium gives you early access, discounts, and priority booking."
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
  badge: {
    backgroundColor: "#E9C34F",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    fontSize: 12,
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