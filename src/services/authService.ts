/**
 * CORE AUTH SERVICE
 * The centralized file for Firebase operations.
 * Handles raw API calls for Authentication (Login, Register, Password Resets)
 * and Firestore user profile management.
 */
import {
  applyActionCode,
  confirmPasswordReset,
  createUserWithEmailAndPassword,
  deleteUser,
  FirebaseAuthTypes,
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  reload,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithCredential,
  signInWithEmailAndPassword,
  signOut,
  updateEmail,
  verifyPasswordResetCode,
} from "@react-native-firebase/auth";
import {
  doc,
  getDoc,
  getFirestore,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
} from "@react-native-firebase/firestore";
import { useEffect } from "react";

export const auth = getAuth(); // Stores Auth instance in the auth var to initialize.

// handles database operations (read/write data).
export const db = getFirestore(); // handles database operations (read/write data).

export const ERROR_MESSAGES: Record<string, string> = {
  "auth/email-already-in-use": "This email is already registered.",
  "auth/invalid-email": "The email address is invalid.",
  "auth/user-not-found": "No account found with this email.",
  "auth/wrong-password": "Incorrect password.",
  "auth/expired-action-code":
    "The reset link has expired. Please request a new one.",
  "auth/invalid-action-code":
    "The reset link is invalid or has already been used.",
  "auth/too-many-requests": "Too many attempts. Try again later.",
};

// Defines the structure of the data required to register a new user.
export interface RegisterData {
  firstName: string;
  lastName: string;
  gender: "male" | "female" | "other";
  dateOfBirth: Date;
}

/**
 * @summary Logs in user with their email and password, also checks if email is verified.
 * @param email User's inputted email.
 * @param pass  User's inputted password.
 */
export async function loginUser(email: string, pass: string) {
  // Signs the user in via Firebase Auth
  const { user } = await signInWithEmailAndPassword(auth, email, pass);
  await reload(user);
  const refreshedUser = auth.currentUser;
  // Returns the user object and true/false if they have verified their email
  return {
    user: refreshedUser,
    verified: refreshedUser?.emailVerified ?? false,
  };
}

/**
 *@summary Creates Auth account,Firestore user profile and Sends email verification link.
 * @param email - user's email
 * @param password - user's password
 * @param profile - user's profile data

 */
export async function registerUser(
  email: string,
  password: string,
  profile: RegisterData,
) 

{
  const { user } = await createUserWithEmailAndPassword(auth, email, password); // Creates users login credentials in Firebase Auth

  // Creates "users" collection with Firebase UID as doc ID
  try {
    const userRef = doc(db, "users", user.uid);
    await setDoc(userRef, {
      email: email.toLowerCase(),
      firstName: profile.firstName.trim(),
      lastName: profile.lastName.trim(),
      gender: profile.gender,
      dateOfBirth: Timestamp.fromDate(profile.dateOfBirth),
      role: "general",
      selectedTags: [],
      onboardingComplete: false,
      createdAt: serverTimestamp(),
    });

    // Send verification email
    await sendEmailVerification(user);

    // Rollback Auth account if Firestore write fails
  } catch (e) {
    await deleteUser(user);
    throw e;
  }
}

export type GoogleSignInProfile = {
  givenName?: string | null;
  familyName?: string | null;
  name?: string | null;
  photo?: string | null;
};

/**
 * After Firebase Auth sign-in with Google, ensure `users/{uid}` exists with the same
 * core fields as email/password registration. Does not overwrite an existing profile.
 */
export async function ensureGoogleUserFirestoreProfile(
  googleUser?: GoogleSignInProfile,
): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error("No signed-in user");

  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);
  if (snap.exists()) return;

  const email = (user.email ?? "").toLowerCase();
  let firstName = (googleUser?.givenName ?? "").trim();
  let lastName = (googleUser?.familyName ?? "").trim();

  if (!firstName && !lastName) {
    const display = (user.displayName ?? googleUser?.name ?? "").trim();
    if (display) {
      const parts = display.split(/\s+/);
      firstName = parts[0] ?? "User";
      lastName = parts.slice(1).join(" ");
    }
  }
  if (!firstName) firstName = "User";

  const photo =
    user.photoURL ?? (googleUser?.photo ? String(googleUser.photo) : null);

  await setDoc(userRef, {
    email,
    firstName,
    lastName,
    role: "general",
    selectedTags: [],
    onboardingComplete: false,
    createdAt: serverTimestamp(),
    ...(photo ? { photoURL: photo } : {}),
    authProvider: "google",
  });
}

/**
 * Sign into Firebase Auth with a Google ID token (from @react-native-google-signin).
 */
export async function signInWithGoogleIdToken(idToken: string) {
  const credential = GoogleAuthProvider.credential(idToken);
  await signInWithCredential(auth, credential);
  await reload(auth.currentUser!);
}

/**
 *@summary Updates Firebase Auth and Firestore with user's new email address.
 *@param newEmail The user's new email address.
 */
export async function updateUserEmail(newEmail: string) {
  const user = auth.currentUser;
  if (!user) throw new Error("No user logged in");

  // Update the Firebase Auth email
  await updateEmail(user, newEmail);

  // Update the Firestore Profile email
  const userRef = doc(db, "users", user.uid);
  await updateDoc(userRef, {
    email: newEmail.toLowerCase(),
    updatedAt: serverTimestamp(),
  });
}

/**
 *@summary A verification email is delivered to the user's email and opens the app directly.
 */
export async function resendVerificationEmail() {
  const user = auth.currentUser;
  if (!user) throw new Error("auth/no-current-user");

  // Just send the default email
  await sendEmailVerification(user);
}

/**
 *@summary Sends a password reset email to the user.
 *@param email User's email address.
 */
export async function sendPasswordReset(email: string) {
  // Just send the default password reset email
  return await sendPasswordResetEmail(auth, email);
}

/**
 *@summary Verifies a password reset code (oobCode) from the email link.
 *@param oobCode - The unique code from the password reset email.
 */
export async function getPasswordResetEmail(oobCode: string) {
  return await verifyPasswordResetCode(auth, oobCode);
}

/**
 *@summary Resets the user's password using the oobCode from the reset link.
 *@param oobCode The unique code from the password reset email.
 *@param newPass The new password entered by the user.
 */
export async function resetPasswordWithCode(oobCode: string, newPass: string) {
  return await confirmPasswordReset(auth, oobCode, newPass);
}

/**
 *@summary Returns the latest user profile data from Firebase
 */
export async function reloadUser() {
  const user = auth.currentUser;
  if (!user) return null;
  await reload(user);
  return auth.currentUser;
}

/**
 ** @summaryEnds user's active session in app.
 */
export async function logoutUser() {
  await signOut(auth);
}

/**
 * @summary Converts technical Firebase error codes into readable messages for the user.
 * @parame The raw error caught from a Firebase function.
 */
export function getFriendlyError(e: any): string {
  return ERROR_MESSAGES[e?.code] ?? e?.message ?? "Something went wrong.";
}

/**
 * @summary listens for changes in the user's login status.
 * @param callback A function that runs whenever the user logs in or out.
 */
export function useAuthState(
  callback: (user: FirebaseAuthTypes.User | null) => void,
) {
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, callback);
    return () => unsubscribe();
  }, []);
}

// Export Firestore utilities for use on other files
export {
  applyActionCode,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc
};

