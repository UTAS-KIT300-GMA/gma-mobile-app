import {
  STRIPE_CURRENCY,
  STRIPE_PAYMENT_INTENT_URL,
} from "@/config/stripe";

export type TicketPaymentMetadata = Record<string, string>;

export type CreatePaymentIntentRequest = {
  /** Amount in the smallest currency unit (e.g. cents for USD). */
  amount: number;
  currency?: string;
  metadata?: TicketPaymentMetadata;
};

type ServerIntentResponse = {
  clientSecret?: string;
  client_secret?: string;
  error?: string;
  message?: string;
};

/**
 * Calls your backend to create a PaymentIntent and returns its client secret.
 *
 * Your endpoint should:
 * 1. Authenticate the user (e.g. verify Firebase ID token).
 * 2. Load the event from your database and compute the price server-side.
 * 3. Create a PaymentIntent with `stripe.paymentIntents.create({ amount, currency, automatic_payment_methods: { enabled: true }, metadata })`.
 * 4. Return JSON `{ "clientSecret": pi_xxx_secret_xxx }`.
 *
 * Never trust the client amount alone for paid tickets; reconcile against server state.
 */
export async function requestPaymentIntentClientSecret(
  body: CreatePaymentIntentRequest,
  idToken: string | null,
): Promise<{ clientSecret: string } | { error: string }> {
  if (!STRIPE_PAYMENT_INTENT_URL) {
    return {
      error:
        "Missing EXPO_PUBLIC_STRIPE_PAYMENT_INTENT_URL. Add an HTTPS endpoint that creates a PaymentIntent.",
    };
  }

  if (!Number.isFinite(body.amount) || body.amount < 1) {
    return { error: "Invalid payment amount." };
  }

  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };
  if (idToken) {
    headers.Authorization = `Bearer ${idToken}`;
  }

  try {
    const res = await fetch(STRIPE_PAYMENT_INTENT_URL, {
      method: "POST",
      headers,
      body: JSON.stringify({
        amount: Math.round(body.amount),
        currency: (body.currency ?? STRIPE_CURRENCY).toLowerCase(),
        metadata: body.metadata ?? {},
      }),
    });

    const data = (await res.json()) as ServerIntentResponse;

    if (!res.ok) {
      const msg =
        data.error ||
        data.message ||
        `Payment setup failed (${res.status}).`;
      return { error: msg };
    }

    const clientSecret = data.clientSecret ?? data.client_secret;
    if (!clientSecret || typeof clientSecret !== "string") {
      return {
        error: "Server did not return a PaymentIntent client secret.",
      };
    }

    return { clientSecret };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Network error";
    return { error: message };
  }
}

/**
 * Parses a display price string (e.g. "12.50" or "$12.50") to minor units.
 */
export function priceStringToMinorUnits(price: string): number {
  const n = parseFloat(String(price).replace(/[^0-9.]/g, ""));
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.round(n * 100);
}
