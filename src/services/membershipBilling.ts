import {
  fetchProducts,
  endConnection,
  finishTransaction,
  initConnection,
  purchaseErrorListener,
  purchaseUpdatedListener,
  requestPurchase,
} from "react-native-iap";
import { auth, db, doc, serverTimestamp, updateDoc } from "@/services/authService";

const DEFAULT_PREMIUM_MONTHLY = "gma_premium_monthly";
const DEFAULT_PREMIUM_YEARLY = "gma_premium_yearly";
const DEFAULT_PREMIUM_PREPAID = "gma_premium_prepaid";

const configuredSkus = [
  process.env.EXPO_PUBLIC_PLAY_SUBSCRIPTION_MONTHLY_SKU,
].filter((value): value is string => !!value?.trim());

export const MEMBERSHIP_SUBSCRIPTION_SKUS =
  configuredSkus.length > 0
    ? configuredSkus
    : [DEFAULT_PREMIUM_MONTHLY, DEFAULT_PREMIUM_YEARLY, DEFAULT_PREMIUM_PREPAID];

export type BillingOfferOption = {
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

export async function initBillingConnection(): Promise<void> {
  await initConnection();
}

export function closeBillingConnection(): void {
  endConnection();
}

function titleFromProduct(product: any): string {
  const rawTitle = String(product?.title ?? "GMA Premium");
  return rawTitle.replace(/\s+\(.*\)$/, "").trim();
}

export async function fetchMembershipOfferOptions(): Promise<BillingOfferOption[]> {
  let subscriptions: any[] = [];
  try {
    const iapModule = await import("react-native-iap");
    const getSubscriptionsMaybe = (iapModule as any).getSubscriptions;
    if (typeof getSubscriptionsMaybe === "function") {
      subscriptions = await getSubscriptionsMaybe({
        skus: MEMBERSHIP_SUBSCRIPTION_SKUS,
      });
    } else {
      subscriptions = (await fetchProducts({
        skus: MEMBERSHIP_SUBSCRIPTION_SKUS,
        type: "subs",
      })) as any[];
    }
  } catch (error) {
    const errText =
      error instanceof Error ? error.message : JSON.stringify(error ?? {});
    throw new Error(
      `Unable to query Play subscriptions for SKUs [${MEMBERSHIP_SUBSCRIPTION_SKUS.join(", ")}]. ${errText}`,
    );
  }

  const normalized: BillingOfferOption[] = [];

  subscriptions.forEach((product: any) => {
    const title = titleFromProduct(product);
    const description = String(product?.description ?? "");
    const defaultPrice = String(
      product?.localizedPrice ?? product?.subscriptionPrice ?? "",
    );
    const offerDetails: any[] = Array.isArray(product?.subscriptionOfferDetailsAndroid)
      ? product.subscriptionOfferDetailsAndroid
      : Array.isArray(product?.subscriptionOfferDetails)
        ? product.subscriptionOfferDetails
        : [];

    if (!offerDetails.length) {
      normalized.push({
        productId: String(product?.productId ?? ""),
        title,
        description,
        displayPrice: defaultPrice || "See Play checkout",
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
      const displayPrice = String(
        firstPhase?.formattedPrice ?? defaultPrice ?? "See Play checkout",
      );
      const period = String(firstPhase?.billingPeriod ?? "").replace("P", "");
      const recurrence = Number(firstPhase?.recurrenceMode ?? 0);
      const recurrenceLabel =
        recurrence === 2 ? "finite" : recurrence === 1 ? "auto-renewing" : "plan";
      const tags = Array.isArray(offer?.offerTags)
        ? offer.offerTags.map((tag: unknown) => String(tag))
        : [];
      normalized.push({
        productId: String(product?.productId ?? ""),
        title,
        description,
        displayPrice,
        durationLabel: period ? `${period} (${recurrenceLabel})` : recurrenceLabel,
        offerToken: offer?.offerToken ? String(offer.offerToken) : undefined,
        offerId: offer?.offerId ? String(offer.offerId) : undefined,
        basePlanId: offer?.basePlanId ? String(offer.basePlanId) : undefined,
        tags,
      });
    });
  });

  return normalized.filter((option) => option.productId.length > 0);
}

export async function buyMembershipOption(option: BillingOfferOption): Promise<void> {
  const androidOfferToken = option.offerToken;
  const iapModule = await import("react-native-iap");
  const requestSubscriptionMaybe = (iapModule as any).requestSubscription;

  if (typeof requestSubscriptionMaybe === "function") {
    await requestSubscriptionMaybe({
      sku: option.productId,
      ...(androidOfferToken
        ? {
            subscriptionOffers: [
              {
                sku: option.productId,
                offerToken: androidOfferToken,
              },
            ],
          }
        : {}),
    });
    return;
  }

  await requestPurchase({
    request: {
      google: {
        skus: [option.productId],
        ...(androidOfferToken
          ? {
              subscriptionOffers: [
                {
                  sku: option.productId,
                  offerToken: androidOfferToken,
                },
              ],
            }
          : {}),
      },
    } as any,
    type: "subs",
  });
}

async function applyMembershipToFirestore(purchase: any): Promise<void> {
  const uid = auth.currentUser?.uid;
  if (!uid) return;
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, {
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

export function startMembershipPurchaseListeners(
  onPurchaseSuccess?: () => void,
  onPurchaseError?: (message: string) => void,
): () => void {
  const purchaseSub = purchaseUpdatedListener(async (purchase: any) => {
    try {
      await finishTransaction({ purchase, isConsumable: false } as any);
      await applyMembershipToFirestore(purchase);
      onPurchaseSuccess?.();
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Failed to activate your membership.";
      onPurchaseError?.(message);
    }
  });

  const errorSub = purchaseErrorListener((error: any) => {
    const code = String(error?.code ?? "");
    if (code === "E_USER_CANCELLED") return;
    const message = String(error?.message ?? "Purchase failed.");
    onPurchaseError?.(message);
  });

  return () => {
    purchaseSub.remove();
    errorSub.remove();
  };
}
