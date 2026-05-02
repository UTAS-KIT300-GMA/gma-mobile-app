/**
 * Stored on Firestore `users/{uid}.notificationSettings` for the member app.
 * Email/SMS/product/payment flags are persisted for backend use; push + specialOffers affect the client.
 */
export type NotificationSettings = {
  emailNotification: boolean;
  pushNotification: boolean;
  smsNotification: boolean;
  specialOffers: boolean;
  productUpdate: boolean;
  paymentReminder: boolean;
};

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  emailNotification: true,
  pushNotification: true,
  smsNotification: false,
  specialOffers: true,
  productUpdate: false,
  paymentReminder: true,
};

function readBool(
  raw: Record<string, unknown>,
  key: keyof NotificationSettings,
  fallback: boolean,
): boolean {
  const v = raw[key];
  return typeof v === "boolean" ? v : fallback;
}

export function mergeNotificationSettings(raw: unknown): NotificationSettings {
  const d = DEFAULT_NOTIFICATION_SETTINGS;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { ...d };
  }
  const o = raw as Record<string, unknown>;
  return {
    emailNotification: readBool(o, "emailNotification", d.emailNotification),
    pushNotification: readBool(o, "pushNotification", d.pushNotification),
    smsNotification: readBool(o, "smsNotification", d.smsNotification),
    specialOffers: readBool(o, "specialOffers", d.specialOffers),
    productUpdate: readBool(o, "productUpdate", d.productUpdate),
    paymentReminder: readBool(o, "paymentReminder", d.paymentReminder),
  };
}
