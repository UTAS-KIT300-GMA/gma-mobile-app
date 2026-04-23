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
  FacebookAuthProvider,
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
 * @summary Logs in the user with email and password and checks if their email is verified.
 * @param email - The user's email address.
 * @param pass - The user's password.
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
 * @summary Creates a Firebase Auth account and Firestore user profile, then sends an email verification link.
 * @param email - The user's email address.
 * @param password - The user's chosen password.
 * @param profile - The user's registration profile data (name, gender, date of birth).
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

export type FacebookSignInProfile = {
  first_name?: string | null;
  last_name?: string | null;
  name?: string | null;
  picture?: {
    data?: {
      url?: string | null;
    };
  };
};

/**
 * @summary Ensures a Firestore user profile exists for a Google sign-in, creating it on first sign-in without overwriting an existing profile.
 * @param googleUser - Optional Google profile data used to populate first/last name and photo.
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
 * @summary Ensures a Firestore user profile exists for a Facebook sign-in, creating it on first sign-in and updating photo/provider on subsequent sign-ins.
 * @param facebookUser - Optional Facebook profile data used to populate first/last name and photo.
 */
export async function ensureFacebookUserFirestoreProfile(
  facebookUser?: FacebookSignInProfile,
): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error("No signed-in user");

  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);

  const email = (user.email ?? "").toLowerCase();
  let firstName = (facebookUser?.first_name ?? "").trim();
  let lastName = (facebookUser?.last_name ?? "").trim();

  if (!firstName && !lastName) {
    const display = (user.displayName ?? facebookUser?.name ?? "").trim();
    if (display) {
      const parts = display.split(/\s+/);
      firstName = parts[0] ?? "User";
      lastName = parts.slice(1).join(" ");
    }
  }
  if (!firstName) firstName = "User";

  const photo =
    user.photoURL ??
    facebookUser?.picture?.data?.url ??
    null;

  if (!snap.exists()) {
    // First Facebook sign-in for this uid: create profile once.
    await setDoc(userRef, {
      email,
      firstName,
      lastName,
      role: "general",
      selectedTags: [],
      onboardingComplete: false,
      createdAt: serverTimestamp(),
      ...(photo ? { photoURL: photo } : {}),
      authProvider: "facebook",
    });
    return;
  }

  // Subsequent sign-ins: update only selected fields, no new docs.
  await setDoc(
    userRef,
    {
      ...(photo ? { photoURL: photo } : {}),
      authProvider: "facebook",
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

/**
 * @summary Signs into Firebase Auth using a Google ID token obtained from @react-native-google-signin.
 * @param idToken - The ID token returned by the Google Sign-In SDK.
 */
export async function signInWithGoogleIdToken(idToken: string) {
  const credential = GoogleAuthProvider.credential(idToken);
  await signInWithCredential(auth, credential);
  await reload(auth.currentUser!);
}

/**
 * @summary Signs into Firebase Auth using a Facebook access token obtained from the Facebook SDK.
 * @param accessToken - The access token returned by the Facebook Login SDK.
 */
export async function signInWithFacebookAccessToken(accessToken: string) {
  const credential = FacebookAuthProvider.credential(accessToken);
  await signInWithCredential(auth, credential);
  await reload(auth.currentUser!);
}

/**
 * @summary Updates both Firebase Auth and the Firestore profile with the user's new email address.
 * @param newEmail - The new email address to apply.
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
 * @summary Sends a new email verification link to the currently signed-in user's email address.
 */
export async function resendVerificationEmail() {
  const user = auth.currentUser;
  if (!user) throw new Error("auth/no-current-user");

  // Just send the default email
  await sendEmailVerification(user);
}

/**
 * @summary Sends a password reset email to the specified address via Firebase Auth.
 * @param email - The email address to send the reset link to.
 */
export async function sendPasswordReset(email: string) {
  // Just send the default password reset email
  return await sendPasswordResetEmail(auth, email);
}

/**
 * @summary Verifies a password reset code from the email link and returns the associated email address.
 * @param oobCode - The unique action code extracted from the password reset email link.
 */
export async function getPasswordResetEmail(oobCode: string) {
  return await verifyPasswordResetCode(auth, oobCode);
}

/**
 * @summary Resets the user's password using the action code from the reset email link.
 * @param oobCode - The unique action code extracted from the password reset email link.
 * @param newPass - The new password to set for the account.
 */
export async function resetPasswordWithCode(oobCode: string, newPass: string) {
  return await confirmPasswordReset(auth, oobCode, newPass);
}

/**
 * @summary Reloads the current Firebase Auth user to get the latest profile data, including email verification status.
 */
export async function reloadUser() {
  const user = auth.currentUser;
  if (!user) return null;
  await reload(user);
  return auth.currentUser;
}

/**
 * @summary Ends the user's active Firebase Auth session.
 */
export async function logoutUser() {
  await signOut(auth);
}

/**
 * @summary Converts a Firebase error code into a user-friendly error message string.
 * @param e - The raw error caught from a Firebase function call.
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

