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
  deleteUser,
  updateEmail
} from "@react-native-firebase/auth";
import {
  getFirestore,
  Timestamp,
  serverTimestamp,
  doc,
  setDoc,
  updateDoc,
  getDoc
} from "@react-native-firebase/firestore";

export const auth = getAuth();    // Stores Auth instance in the auth var to initialize. 
export const db = getFirestore(); // handles database operations (read/write data).

export const ERROR_MESSAGES: Record<string, string> = {
  "auth/email-already-in-use": "This email is already registered.",
  "auth/invalid-email": "The email address is invalid.",
  "auth/user-not-found": "No account found with this email.",
  "auth/wrong-password": "Incorrect password.",
  "auth/expired-action-code": "The reset link has expired. Please request a new one.",
  "auth/invalid-action-code": "The reset link is invalid or has already been used.",
  "auth/too-many-requests": "Too many attempts. Try again later.",
};

// Defines the structure of the data required to register a new user.
export interface RegisterData {
  firstName: string;
  lastName: string;
  gender: "male" | "female" | "other";
  dateOfBirth: Date;
}

export async function loginUser(email: string, pass: string) {
/** 
 ** Logs in user with their email and password, also checks if email is verified.
 * 
 * * Parameters:
 * email - user's inputted email.
 * pass  - user's inputted password. 
 * 
 ** Outcome: 
 *Returns the refreshed user profile and true/false value indicating verification status.
 */

  // Signs the user in via Firebase Auth
  const { user } = await signInWithEmailAndPassword(auth, email, pass);
  await reload(user);
  const refreshedUser = auth.currentUser; 
  
  // Returns the user object and true/false if they have verified their email
  return { user: refreshedUser, verified: refreshedUser?.emailVerified ?? false };
}

export async function registerUser(email: string, password: string, profile: RegisterData) {
/** 
 ** Registers user in Firebase Auth and Firestore.
 *
 ** Parameters:
 * email - user's email
 * password - user's password
 * profile - user's profile data
 *
 ** Outcome: 
 * Creates Auth account,Firestore user profile and Sends email verification link. 
 */
  const { user } = await createUserWithEmailAndPassword(auth, email, password);  // Creates users login credentials in Firebase Auth
   
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

export async function updateUserEmail(newEmail: string) {
/** 
 ** Updates the user's email address in both Firebase Auth and Firestore.
 *
 ** Parameters:
 * newEmail - The user's new email address.
 *
 ** Outcome: 
 * Updates Firebase Auth and Firestore with user's new email address. 
 */
  const user = auth.currentUser;
  if (!user) throw new Error("No user logged in");

  // Update the Firebase Auth email
  await updateEmail(user, newEmail);

  // Update the Firestore Profile email
  const userRef = doc(db, "users", user.uid);
  await updateDoc(userRef, { 
    email: newEmail.toLowerCase(),
    updatedAt: serverTimestamp() 
  });
}

export async function resendVerificationEmail() {
/** 
** Sends a new email verification link to the logged in user.
* 
** Outcome:
*A verification email is delivered to the user's email and opens the app directly.
*/
  const user = auth.currentUser;
  if (!user) throw new Error("auth/no-current-user");
  await sendEmailVerification(user);
}

export async function sendPasswordReset(email: string) {
/**
 ** Sends a password reset email to the user.
 *
 ** Parameters:
 * email - User's email address
 *
 ** Outcome:
 *The user receives a password reset link.
 */
  return await sendPasswordResetEmail(auth, email);
}

export async function getPasswordResetEmail(oobCode: string) {
/** 
 ** Verifies a password reset code (oobCode) from the email link.
 *
 ** Parameters:
 *oobCode - The unique code from the password reset email.
 *
 ** Outcome:
 * Returns the email address associated with the code if valid.
 */
  return await verifyPasswordResetCode(auth, oobCode);
}

export async function resetPasswordWithCode(oobCode: string, newPass: string) {
/** 
 ** Resets the user's password using the oobCode from the reset link.
*
** Parameters:
* oobCode - The unique code from the password reset email.
* newPass - The new password entered by the user.
* 
** Outcome:
* Updates the user's password in Firebase Auth.
*/
  return await confirmPasswordReset(auth, oobCode, newPass);
}

export async function reloadUser() {

/** 
 ** Refreshes the user's data from Firebase.  
 * 
 ** Outcome:
 *Returns the latest user profile data from Firebase, or null if user not logged in.
 */
  const user = auth.currentUser; 
  if (!user) return null;
  await reload(user);
  return auth.currentUser;
}

export async function logoutUser() {
/** 
** Ends user's active session in app.
*
** Outcome:
* User is logged out of the app.
*/
  await signOut(auth);
}

export function getFriendlyError(e: any): string {
/** 
 ** Converts technical Firebase error codes into readable messages for the user.
*
** Parameters:
* e - The raw error caught from a Firebase function.
* 
** Outcome:
* Returns a clean, user-friendly string mapped from the ERROR_MESSAGES list.
*/
  return ERROR_MESSAGES[e?.code] ?? e?.message ?? "Something went wrong.";
}

export function useAuthState(callback: (user: FirebaseAuthTypes.User | null) => void) {
/** 
 ** listens for changes in the user's login status.
 * 
 ** Parameters:
 * callback - A function that runs whenever the user logs in or out
 * 
 ** Outcome:
 * The app stays in sync with the user's authentication state across different screens.
 */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, callback);
    return () => unsubscribe();
  }, []);
}

// Export Firestore utilities for use on other files
export {
  Timestamp,
  serverTimestamp,
  doc,
  setDoc,
  updateDoc,
  applyActionCode,
  getDoc
};