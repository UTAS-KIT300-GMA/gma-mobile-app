/**
 * Client-side Stripe configuration (publishable key + API URL).
 * Set these in `.env` for local dev and in EAS secrets for builds.
 */
export const STRIPE_PUBLISHABLE_KEY =
  process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";

/** HTTPS endpoint that creates a Stripe PaymentIntent and returns `{ clientSecret }`. */
export const STRIPE_PAYMENT_INTENT_URL =
  process.env.EXPO_PUBLIC_STRIPE_PAYMENT_INTENT_URL ?? "";

/** ISO 3166-1 alpha-2 country for Apple Pay / Google Pay (e.g. US, AU). */
export const STRIPE_MERCHANT_COUNTRY =
  process.env.EXPO_PUBLIC_STRIPE_MERCHANT_COUNTRY ?? "AU";

/** Three-letter currency (default AUD). */
export const STRIPE_CURRENCY =
  (process.env.EXPO_PUBLIC_STRIPE_CURRENCY ?? "AUD").toLowerCase();

/** iOS Apple Pay merchant ID from the Apple Developer portal (optional). */
export const STRIPE_MERCHANT_IDENTIFIER =
  process.env.EXPO_PUBLIC_STRIPE_MERCHANT_IDENTIFIER;
