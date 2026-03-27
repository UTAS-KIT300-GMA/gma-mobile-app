/**
 **VERIFICATION ROUTE**
 * Manages the logic for the verification UI.
 * Handles user interactions for resending verification emails and logging out, 
 * holding the user in place until their email status is confirmed.
 */
import { useState } from "react";
import { Alert } from "react-native";
import { auth, resendVerificationEmail, logoutUser, getFriendlyError } from "@/services/authService";
import { VerifyUI } from "@/screens/auth/verify-user-screen"; // Adjust this import to match your folder structure

export default function VerifyUserRoute() {
/**
* Logic for the verify user UI.
* 
** Outcome:
* Manages the user's email display and verification resends.
* Handles logout sessions to safely exit the verification flow.
* Holds user until their email is confirmed.
*/
  const [loading, setLoading] = useState(false);                     // Stores true/false value to track network requests.
  const userEmail = auth.currentUser?.email ?? "your email address"; // Safely extracts the user's email to pass to the UI.
  
  const handleResend = async () => {
  /** Handles resending the verification email.
  * 
  ** Outcome:
  * Triggers the Firebase function to send a new email and shows a success alert.
  */
    setLoading(true); // Shows the loading spinner for the resend process.
    
    // Sends the verification link and notifies user of result.
    try {
      await resendVerificationEmail();
      Alert.alert("Email Sent", "A new verification link has been sent to your email.");
    } catch (e: any) {
      console.error("Resend error:", e);
      Alert.alert("Error", getFriendlyError(e));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
  /** * Handles logging the user out.
   *
   **Outcome:
   *Ends the Firebase session. The Layout will 
   *detect the state change and automatically boot the user back to landing screen.
   */
    setLoading(true); // Shows the loading spinner for the logout process.
    
    try {
      await logoutUser();
    } catch (e: any) {
      console.error("Logout error:", e);
      Alert.alert("Error", getFriendlyError(e));
      } finally {
        setLoading(false);
    }
  };
  
  // Passes verification logic, current state  and user state to the verification UI.
  return (
    <VerifyUI 
      email={userEmail}
      onResend={handleResend}
      onLogout={handleLogout}
      loading={loading}
    />
  );
}