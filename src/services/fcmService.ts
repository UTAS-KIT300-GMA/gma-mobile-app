/**
 * Android FCM registration using the same Firestore fields as the web portal:
 * fcmTokens  and fcmTokenUpdatedAt.
 */
import messaging from "@react-native-firebase/messaging";
import {
  arrayUnion,
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from "@react-native-firebase/firestore";
import { PermissionsAndroid, Platform } from "react-native";
import { db } from "@/services/authService";

/**
 * @summary Requests Android 13+ notification permission when needed.
 * @Returns {Promise<boolean>} True when posting notifications is allowed.
 */
async function ensureAndroidNotificationPermission(): Promise<boolean> {
  if (Platform.OS !== "android") return false;
  if (typeof Platform.Version !== "number" || Platform.Version < 33) {
    return true;
  }
  const result = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
  );
  return result === PermissionsAndroid.RESULTS.GRANTED;
}

/**
 * @summary Registers the device FCM token on `users/{userId}` (matches web `registerUserFcmToken` fields).
 * @param userId - Firebase Auth uid.
 * @throws {Error} When Firestore update fails (caller may catch).
 * @Returns {Promise<void>}
 */
export async function registerUserFcmToken(userId: string): Promise<void> {
  if (Platform.OS !== "android") return;

  const allowed = await ensureAndroidNotificationPermission();
  if (!allowed) return;

  await messaging().requestPermission();

  const token = await messaging().getToken();
  if (!token) return;

  const userRef = doc(db, "users", userId);
  const snap = await getDoc(userRef);
  if (!snap.exists()) return;

  await updateDoc(userRef, {
    fcmTokens: arrayUnion(token),
    fcmTokenUpdatedAt: serverTimestamp(),
  });
}
