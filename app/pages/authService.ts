import {
    createUserWithEmailAndPassword,
    deleteUser,
    reload,
    sendEmailVerification,
    signInWithEmailAndPassword,
    signOut,
} from "@react-native-firebase/auth";

import {
    doc,
    serverTimestamp,
    setDoc,
    Timestamp,
} from "@react-native-firebase/firestore";

import { auth, db } from "../firebase";

const ERROR_MESSAGES: Record<string, string> = {
  "auth/wrong-password":         "Incorrect password.",
  "auth/user-not-found":         "No account with that email.",
  "auth/email-already-in-use":   "Email already registered.",
  "auth/weak-password":          "Password must be 6+ characters.",
  "auth/invalid-email":          "Please enter a valid email address.",
  "auth/too-many-requests":      "Too many attempts. Try again later.",
  "auth/network-request-failed": "Check your internet connection.",
};

export function getFriendlyError(e: any): string {
  return ERROR_MESSAGES[e?.code] ?? "Something went wrong.";
}

export interface RegisterData {
  firstName:   string;
  lastName:    string;
  gender:      "male" | "female" | "other";
  dateOfBirth: Date;
}

/**
 * Creates auth user, writes Firestore profile, sends verification email.
 * Rolls back auth account if Firestore write fails.
 */
export async function registerUser(
  email: string,
  password: string,
  profile: RegisterData
): Promise<void> {
  const { user } = await createUserWithEmailAndPassword(auth, email, password);

  try {
    await setDoc(doc(db, "users", user.uid), {
      email,
      firstName:   profile.firstName.trim(),
      lastName:    profile.lastName.trim(),
      gender:      profile.gender,
      dateOfBirth: Timestamp.fromDate(profile.dateOfBirth),
      role:         "general",
      interestTags: [],
      createdAt:    serverTimestamp(),
    });

    await sendEmailVerification(user);
  } catch (error) {
    // Firestore failed — roll back auth account to avoid orphaned users
    await deleteUser(user);
    throw error;
  }
}

/**
 * Signs in, reloads token to get fresh emailVerified status,
 * then blocks and signs out if email is unverified.
 * Returns true if login succeeded and email is verified.
 */
export async function loginUser(
  email: string,
  password: string
): Promise<{ verified: boolean }> {
  await signInWithEmailAndPassword(auth, email, password);
  await reload(auth.currentUser!);

  if (!auth.currentUser?.emailVerified) {
    await signOut(auth);
    return { verified: false };
  }

  return { verified: true };
}

export async function resendVerificationEmail(): Promise<void> {
  if (auth.currentUser) {
    await sendEmailVerification(auth.currentUser);
  }

  
}

export async function logoutUser(): Promise<void> {
  await signOut(auth);
}