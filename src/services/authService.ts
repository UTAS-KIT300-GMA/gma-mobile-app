/** 
*This file manages the Firebase logic for authentication and Firestore user profiles for GMA's app.
*It handels login, logout, registration and password managment.
*/

import { useEffect } from "react";
import { getApp } from "@react-native-firebase/app";
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
  verifyPasswordResetCode
} from "@react-native-firebase/auth";
import {
  getFirestore,
  Timestamp,
  serverTimestamp,
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  collection,
  addDoc,
  getDoc
} from "@react-native-firebase/firestore";


// Initialization 
const app = getApp();
// handles user authentication (login, register etc).
export const auth = getAuth(app); 

// handles database operations (read/write data).
export const db = getFirestore(app); 


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


// Auth Functions 


export async function loginUser(email: string, pass: string) {
/**
 *Logs in user with their email and password, also checks if email is verified.
 *  
 * Parmeters:
 * email - user's inputted email.
 * pass  - user's inputted password. 
 * 
 * Outcome: 
 * A refreshed user profile and a boolean indicating verification status.
 */
  
 // Stores the result of login attempt.
 const { user } = await signInWithEmailAndPassword(auth, email, pass); 
 
 await reload(user);
 
 // Stores the updated user profile.
 const refreshedUser = auth.currentUser; 

 return {
   user: refreshedUser,
   verified: refreshedUser?.emailVerified ?? false,
 };
}


export async function sendPasswordReset(email: string) {
 /**
 *Sends a password reset email to users email address.
 *  
 * Parmeters:
 * email - Users email address.
 *  
 * Outcome: 
* Completes when the email is successfully sent.
*/
 return await sendPasswordResetEmail(auth, email);
}


export async function getPasswordResetEmail(oobCode: string) {
/**
 * Verifies that the password reset link is valid with the associated email.
 *  
* Parmeters:
 *  oobCode - The unique code from the password reset email.
 *  
 * Outcome: 
* The user's email address if the code is vaild.
*/
 return await verifyPasswordResetCode(auth, oobCode);
}


export async function resetPasswordWithCode(oobCode: string, newPass: string) {
/**
* Verifies that user has correct code, then enables new password to be entered.
*  
* Parmeters:
* oobCode - The unique code user has inputted.
* newPass - User's inputted new password.  
* 
* Outcome: 
* Completes when the password has been suscessfully updated.
*/
 return await confirmPasswordReset(auth, oobCode, newPass);
}


export async function registerUser(email: string, password: string, profile: RegisterData) {
/**
* Registers user by creating their FirebaseAuth account and their profile in users collection in Firestore.
*  
* Parmeters:
* email - User's inputed email.
* password - User's inputed password.
* profile - User's profile details.
*  
* Outcome: 
* A newly created authentication account and a corresponding user profile in the database.
*/

// Creates a new account in FirebaseAuth and Stores it in user var. 
 const { user } = await createUserWithEmailAndPassword(auth, email, password);
 
 
 try {
  // Defines doc ID of 'users' collection with Auth UID from FirebaseAuth.
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

   await user.sendEmailVerification();
 } catch (e) {
   await user.delete();
   throw e;
  }
}


export async function saveUserInterests(tags: string[]) {
 /**
 * Saves user's interest tags they selected during onboarding (profile setup) and updates their onboarding status.
 *  
* Parmeters:
 * tags - an array of interest tags selected by the user.
 * 
 * Outcome:
 * The user's profile is updated with their selected tags and their onboarding status is marked as complete.
 */
  // Retrieves the user's account from Firebase Auth and stores it in user var.
  const user = auth.currentUser;
   
  
  if (!user) throw new Error("No authenticated user found");
  
  // Defines doc ID of 'users' collection with Auth UID from FirebaseAuth.
  const userRef = doc(db, "users", user.uid);
  
  await updateDoc(userRef, {
   selectedTags: tags,
   onboardingComplete: true,
   updatedAt: serverTimestamp(),
  });
}


export async function resendVerificationEmail() {
/**
* Sends a new email verfication link to the logged in user.
 *  
 * Outcome: 
 * A verification email is delivered to the user's email.
 */
  
  // Retrieves the user's account from Firebase Auth and stores it in user var.
  const user = auth.currentUser;
 
  
  if (!user) throw new Error("auth/no-current-user");

  await user.sendEmailVerification();
}


export async function reloadUser() {
/**
*Refreashes the user's data from firebase.  
*  
 * Outcome:
 * Latest user profile data is recevied from firestore, null if user not logged in.
 */
  
  // Retrieves the user's account from Firebase Auth and stores it in user var.
  const user = auth.currentUser; 
  

  if (!user) return null;

  await reload(user);

  return auth.currentUser;
}


export async function logoutUser() {
/**
* Ends users active session in app.
*  
* Outcome: 
* User is logged out of the app
*/
  await signOut(auth);
}


export function getFriendlyError(e: any): string {
  /**
  * Converts technical Firebase error codes into readable messages for the user.
  * 
  * Parameters:
  * e - The raw error caught from a Firebase function.
  * 
  * Outcome: 
  * A clean, user-friendly string mapped from the ERROR_MESSAGES list.
  */
  return ERROR_MESSAGES[e?.code] ?? e?.message ?? "Something went wrong.";
}


export function useAuthState(callback: (user: FirebaseAuthTypes.User | null) => void) {
/**
* A custom hook that listens for changes in the user's login status.
* 
* Parameters:
* callback - A function that runs whenever the user logs in or out
* 
* Outcome: 
* The app stays in sync with the user's authentication state across different screens.
*/
 useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, callback);
  
  return () => unsubscribe();
  }, []);
}


export {
// Exporting Firestore utilities for other files to use.
  Timestamp,
  serverTimestamp,
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  collection,
  addDoc,
  getDoc
};