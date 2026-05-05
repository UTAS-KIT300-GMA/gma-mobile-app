/**
 * Android FCM registration using the same Firestore fields as the web portal:
 * fcmTokens and fcmTokenUpdatedAt.
 */
import { db } from "@/services/authService";
import {
  arrayRemove,
  arrayUnion,
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from "@react-native-firebase/firestore";
import { getMessaging, getToken, deleteToken, requestPermission } from "@react-native-firebase/messaging";

/**
 * @summary Registers the device FCM token on `users/{userId}`.
 * @param userId - Firebase Auth uid.
 * @throws {Error} When Firestore update fails (caller may catch).
 * @Returns {Promise<void>}
 */
export async function registerUserFcmToken(userId: string): Promise<void> {
  const messaging = getMessaging();

  // get token (modular)
  const token = await getToken(messaging);
  if (!token) return;

  const userRef = doc(db, "users", userId);
  const snap = await getDoc(userRef);
  if (!snap.exists()) return;

  // Check if token already stored to avoid unnecessary Firestore writes
  const existingTokens = snap.data()?.fcmTokens || [];

  // Skip writing to Firestore if already stored
  if (existingTokens.includes(token)) return;

  await updateDoc(userRef, {
    fcmTokens: arrayUnion(token),
    fcmTokenUpdatedAt: serverTimestamp(),
  });
}

/**
 * @summary Removes the current device token from FCM and from `users/{userId}.fcmTokens`.
 */
export async function unregisterUserFcmToken(userId: string): Promise<void> {
  try {
    const messaging = getMessaging();

    const token = await getToken(messaging);

    // delete token (modular)
    await deleteToken(messaging);

    if (!token) return;

    const userRef = doc(db, "users", userId);
    const snap = await getDoc(userRef);
    if (!snap.exists()) return;

    await updateDoc(userRef, {
      fcmTokens: arrayRemove(token),
      fcmTokenUpdatedAt: serverTimestamp(),
    });
  } catch (e) {
    console.warn("[FCM] unregisterUserFcmToken failed:", e);
  }
}
