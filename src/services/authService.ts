/**
 * CORE AUTH SERVICE
 * The centralized file for Firebase operations.
 * Handles raw API calls for Authentication (Login, Register, Password Resets) 
 * and Firestore user profile management.
 */
import { useEffect } from "react";
import {
  getAuth,
  onAuthStateChanged,
  FirebaseAuthTypes,
  signOut,
  reload,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  confirmPasswordReset,
  verifyPasswordResetCode,
  applyActionCode,
  sendEmailVerification,
  deleteUser
} from "@react-native-firebase/auth";
import {
  getFirestore,
  Timestamp,
  serverTimestamp,
  doc,
  setDoc,
  updateDoc
} from "@react-native-firebase/firestore";


// handles user authentication (login, register etc).
export const auth = getAuth(); 

// handles database operations (read/write data).
export const db = getFirestore(); 

export const ERROR_MESSAGES: Record<string, string> = {
  "auth/email-already-in-use": "This email is already registered.",
  "auth/invalid-email": "The email address is invalid.",
  "auth/user-not-found": "No account found with this email.",
  "auth/wrong-password": "Incorrect password.",
  "auth/expired-action-code": "The reset link has expired. Please request a new one.",
  "auth/invalid-action-code": "The reset link is invalid or has already been used.",
  "auth/too-many-requests": "Too many attempts. Try again later.",
};

// Shared Interfaces 
export interface RegisterData {
  firstName: string;
  lastName: string;
  gender: "male" | "female" | "other";
  dateOfBirth: Date;
}

/** * Logs in user with their email and password, also checks if email is verified.
 * * Parameters:
 * email - user's inputted email.
 * pass  - user's inputted password. 
 * * Outcome: 
 * Returns the refreshed user profile and a boolean indicating verification status.
 */
export async function loginUser(email: string, pass: string) {
  const { user } = await signInWithEmailAndPassword(auth, email, pass); 
  await reload(user);
  const refreshedUser = auth.currentUser; 
  return { user: refreshedUser, verified: refreshedUser?.emailVerified ?? false };
}

/** * Registers user in Firebase Auth and Firestore.
 * * Parameters:
 * email - user's email
 * password - user's password
 * profile - user's profile data
 * * Outcome: 
 * - Creates Auth account
 * - Creates Firestore user profile
 * - Sends default email verification link (intercepted by Android manifest)
 */
export async function registerUser(
  email: string,
  password: string,
  profile: RegisterData
) {
  const { user } = await createUserWithEmailAndPassword(auth, email, password);

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

    // Send the default verification email without actionCodeSettings
    await sendEmailVerification(user);

  } catch (e) {
    await deleteUser(user); // Rollback Auth account if Firestore write fails
    throw e;
  }
}

/** * Sends a new email verification link to the logged in user.
 * * Outcome:
 * A verification email is delivered to the user's email and opens the app directly.
 */
export async function resendVerificationEmail() {
  const user = auth.currentUser;
  if (!user) throw new Error("auth/no-current-user");

  // Just send the default email
  await sendEmailVerification(user);
}

/** * Sends a password reset email to the user.
 * * Parameters:
 * email - User's email address
 * * Outcome:
 * The user receives a password reset link that opens the app.
 */
export async function sendPasswordReset(email: string) {
  // Just send the default password reset email
  return await sendPasswordResetEmail(auth, email);
}

/** * Verifies a password reset code (oobCode) from the email link.
 * * Parameters:
 * oobCode - The unique code from the password reset email.
 * * Outcome:
 * Returns the email address associated with the code if valid.
 */
export async function getPasswordResetEmail(oobCode: string) {
  return await verifyPasswordResetCode(auth, oobCode);
}

/** * Resets the user's password using the oobCode from the reset link.
 * * Parameters:
 * oobCode - The unique code from the password reset email.
 * newPass - The new password entered by the user.
 * * Outcome:
 * Updates the user's password in Firebase Auth.
 */
export async function resetPasswordWithCode(oobCode: string, newPass: string) {
  return await confirmPasswordReset(auth, oobCode, newPass);
}

/** * Refreshes the user's data from Firebase.  
 * * Outcome:
 * Returns the latest user profile data from Firebase, or null if user not logged in.
 */
export async function reloadUser() {
  const user = auth.currentUser; 
  if (!user) return null;
  await reload(user);
  return auth.currentUser;
}

/** * Ends user's active session in app.
 * * Outcome:
 * User is logged out of the app.
 */
export async function logoutUser() {
  await signOut(auth);
}

/** * Converts technical Firebase error codes into readable messages for the user.
 * * Parameters:
 * e - The raw error caught from a Firebase function.
 * * Outcome:
 * Returns a clean, user-friendly string mapped from the ERROR_MESSAGES list.
 */
export function getFriendlyError(e: any): string {
  return ERROR_MESSAGES[e?.code] ?? e?.message ?? "Something went wrong.";
}

/** * A custom hook that listens for changes in the user's login status.
 * * Parameters:
 * callback - A function that runs whenever the user logs in or out
 * * Outcome:
 * The app stays in sync with the user's authentication state across different screens.
 */
export function useAuthState(callback: (user: FirebaseAuthTypes.User | null) => void) {
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, callback);
    return () => unsubscribe();
  }, []);
}

// Export Firestore utilities
export {
  Timestamp,
  serverTimestamp,
  doc,
  setDoc,
  updateDoc,
  applyActionCode
};