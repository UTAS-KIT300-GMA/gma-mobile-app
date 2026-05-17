import {getAuth} from "firebase-admin/auth";
import {getFirestore} from "firebase-admin/firestore";
import * as logger from "firebase-functions/logger";
import {defineSecret, defineString} from "firebase-functions/params";
import {onRequest, type Request} from "firebase-functions/v2/https";
import Stripe from "stripe";

export const stripeSecretKey = defineSecret("STRIPE_SECRET_KEY");

/** Display price for membership checkout (AUD dollars, e.g. "9.99"). */
export const membershipPriceAud = defineString("MEMBERSHIP_PRICE_AUD", {
  default: "9.99",
});

const DEFAULT_CURRENCY = "aud";

type CheckoutType = "event" | "content";

type CreatePaymentIntentBody = {
  amount?: number;
  currency?: string;
  metadata?: Record<string, string>;
};

type EventTicketData = {
  ticketPrices?: {member?: number; nonMember?: number};
  totalTickets?: number;
  ticketsSold?: number;
  title?: string;
};

/**
 * @param {Request} req - Incoming HTTP request.
 * @return {string | null} Bearer token or null.
 */
function bearerTokenFromRequest(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header || typeof header !== "string") return null;
  const match = /^Bearer\s+(.+)$/i.exec(header.trim());
  return match?.[1] ?? null;
}

/**
 * @param {string} token - Firebase ID token.
 * @return {Promise<string>} Authenticated user id.
 */
async function verifyIdToken(token: string): Promise<string> {
  const decoded = await getAuth().verifyIdToken(token);
  return decoded.uid;
}

/**
 * @param {unknown} value - Raw metadata value.
 * @return {Record<string, string>} Sanitized string metadata.
 */
function sanitizeMetadata(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object") return {};
  const out: Record<string, string> = {};
  for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
    if (typeof entry === "string") out[key] = entry;
  }
  return out;
}

/**
 * @param {number} dollars - Price in major currency units.
 * @return {number} Amount in minor units (cents).
 */
// function dollarsToMinorUnits(dollars: number): number {
//   return Math.round(dollars * 100);
// }

/**
 * @param {EventTicketData} event - Firestore event document.
 * @param {number} ticketCount - Tickets requested.
 * @return {number} Charge amount in minor units.
 */
// function computeEventAmountMinor(
//   event: EventTicketData,
//   ticketCount: number,
// ): number {
//   const memberPrice = event.ticketPrices?.member ?? 0;
//   const nonMemberPrice = event.ticketPrices?.nonMember ?? 0;
//   if (memberPrice === 0 && nonMemberPrice === 0) {
//     throw new Error("This event does not require payment.");
//   }
//   const unitPrice = memberPrice > 0 ? memberPrice : nonMemberPrice;
//   const totalDollars = unitPrice * ticketCount;
//   const minor = dollarsToMinorUnits(totalDollars);
//   if (minor < 1) {
//     throw new Error("Invalid ticket total.");
//   }
//   return minor;
// }

/**
 * @param {EventTicketData} event - Firestore event document.
 * @param {number} ticketCount - Tickets requested.
 */
function assertTicketAvailability(
  event: EventTicketData,
  ticketCount: number,
): void {
  const total = event.totalTickets ?? 0;
  if (total < 1) return;
  const sold = event.ticketsSold ?? 0;
  if (sold + ticketCount > total) {
    throw new Error("Not enough tickets available.");
  }
}

/**
 * @param {string} membershipAud - Membership price in AUD dollars.
 * @return {number} Amount in minor units.
 */
// function computeMembershipAmountMinor(membershipAud: string): number {
//   const dollars = Number.parseFloat(membershipAud);
//   if (!Number.isFinite(dollars) || dollars <= 0) {
//     throw new Error("Membership price is not configured.");
//   }
//   return dollarsToMinorUnits(dollars);
// }

/**
 * Creates a Stripe PaymentIntent for ticket or membership checkout.
 * Requires Firebase Auth (Bearer ID token).
 * Event totals are computed server-side.
 */
export const createPaymentIntent = onRequest(
  {
    secrets: [stripeSecretKey],
    cors: true,
    region: "australia-southeast1",
  },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).json({error: "Method not allowed"});
      return;
    }

    const idToken = bearerTokenFromRequest(req);
    if (!idToken) {
      res.status(401).json({error: "Missing Authorization Bearer token."});
      return;
    }

    let uid: string;
    try {
      uid = await verifyIdToken(idToken);
    } catch (e) {
      logger.warn("Invalid auth token", e);
      res.status(401).json({error: "Invalid or expired sign-in."});
      return;
    }

    const body = (req.body ?? {}) as CreatePaymentIntentBody;
    const metadata = sanitizeMetadata(body.metadata);
    const checkoutType = (metadata.checkoutType ?? "event") as CheckoutType;
    const currency = (body.currency ?? DEFAULT_CURRENCY).toLowerCase();

    // let amountMinor: number = 0;

    try {
      if (checkoutType === "event") {
        const eventId = metadata.eventId;
        if (!eventId) {
          res.status(400).json({
            error: "eventId is required for event checkout.",
          });
          return;
        }

        const ticketCount = Number.parseInt(metadata.ticketCount ?? "1", 10);
        if (!Number.isFinite(ticketCount) || ticketCount < 1) {
          res.status(400).json({error: "Invalid ticket count."});
          return;
        }

        const snap = await getFirestore()
          .collection("events")
          .doc(eventId)
          .get();
        if (!snap.exists) {
          res.status(404).json({error: "Event not found."});
          return;
        }

        const event = snap.data() as EventTicketData;
        assertTicketAvailability(event, ticketCount);

        // TODO: might need to check user membership status again in backend to calculate the amount
        // amountMinor = computeEventAmountMinor(event, ticketCount);

        metadata.eventId = eventId;
        metadata.ticketCount = String(ticketCount);
        if (event.title) metadata.eventTitle = event.title;
      } else if (checkoutType === "content") {
        // TODO: for checkout with content
      } else {
        res.status(400).json({error: "Unsupported checkout type."});
        return;
      }
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Invalid checkout request.";
      res.status(400).json({error: message});
      return;
    }

    const clientAmount = body?.amount ?? 999;

    // if (
    //   typeof clientAmount === "number" &&
    //   Number.isFinite(clientAmount) &&
    //   clientAmount !== amountMinor
    // ) {
    //   logger.warn("Client amount mismatch", {
    //     uid,
    //     checkoutType,
    //     clientAmount,
    //     serverAmount: clientAmount,
    //   });
    // }

    const secret = stripeSecretKey.value();
    if (!secret) {
      logger.error("STRIPE_SECRET_KEY is not set");
      res.status(500).json({error: "Payment provider is not configured."});
      return;
    }

    const stripe = new Stripe(secret);

    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: clientAmount,
        currency,
        // automatic_payment_methods: {enabled: true},
        metadata: {
          ...metadata,
          checkoutType,
          userId: uid,
        },
      });

      if (!paymentIntent.client_secret) {
        res.status(500).json({error: "Failed to create payment session."});
        return;
      }

      res.status(200).json({clientSecret: paymentIntent.client_secret});
    } catch (e) {
      logger.error("Stripe PaymentIntent create failed", e);
      const message =
        e instanceof Stripe.errors.StripeError ?
          e.message :
          "Could not start payment.";
      res.status(502).json({error: message});
    }
  },
);
