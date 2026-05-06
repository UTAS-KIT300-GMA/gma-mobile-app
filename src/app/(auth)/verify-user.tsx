/**
 **VERIFICATION ROUTE**
 * Manages the logic for the verification UI.
 * Handles user interactions for resending verification emails and logging out, 
 * holding the user in place until their email status is confirmed.
 */
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { Alert, AppState } from "react-native";
import { auth, resendVerificationEmail, logoutUser, getFriendlyError, reloadUser } from "@/services/authService";
import { VerifyUI } from "@/screens/auth/verify-user-screen"; // Adjust this import to match your folder structure

/**
* @summary Manages the user's email display and verification resends. Handles logout sessions to safely exit the verification flow. Holds user until their email is confirmed.
* @throws {never} Errors are handled with user-facing alerts.
* @Returns {React.JSX.Element} Verification UI with resend and logout actions.
*/
export default function VerifyUserRoute() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);                     // Stores true/false value to track network requests.
  const [hasNavigatedToOnboarding, setHasNavigatedToOnboarding] = useState(false);
  const userEmail = auth.currentUser?.email ?? "your email address"; // Safely extracts the user's email to pass to the UI.

  /**
   * @summary Starts verification-state listeners (interval + app foreground) so cross-device email verification is detected and routed to onboarding.
   * @throws {never} Internal refresh errors are caught and logged as warnings.
   * @Returns {void} Registers polling/subscription and cleans them up on unmount or dependency change.
   */
  useEffect(() => {
    let isMounted = true;

    /**
     * @summary Reloads the Firebase user and redirects to onboarding once email verification is detected.
     * @throws {never} Errors are caught internally to avoid interrupting the verification screen.
     * @Returns {Promise<void>} Resolves after refresh and optional navigation complete.
     */
    const refreshVerificationStatus = async () => {
      try {
        if (!auth.currentUser) return;
        await reloadUser();
        if (auth.currentUser?.emailVerified && !hasNavigatedToOnboarding) {
          setHasNavigatedToOnboarding(true);
          router.replace("/(onboarding)");
        }
      } catch (error) {
        // Silent refresh: background checks should not surface noisy alerts.
        console.warn("Verification status refresh failed:", error);
      }
    };

    const intervalId = setInterval(() => {
      if (!isMounted) return;
      void refreshVerificationStatus();
    }, 4000);

    const appStateSubscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active" && isMounted) {
        void refreshVerificationStatus();
      }
    });

    void refreshVerificationStatus();

    return () => {
      isMounted = false;
      clearInterval(intervalId);
      appStateSubscription.remove();
    };
  }, [hasNavigatedToOnboarding, router]);
  
   /** 
  * @summary Triggers the Firebase function to send a new email and shows a success alert.
  * @throws {never} Errors are handled and shown through alerts.
  * @Returns {Promise<void>} Resolves when resend attempt finishes.
  */
  const handleResend = async () => {
 
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

  /** 
   * @summary Ends the Firebase session. The Layout will detect the state change and automatically boot the user back to landing screen.
   * @throws {never} Errors are handled and shown through alerts.
   * @Returns {Promise<void>} Resolves when logout attempt finishes.
   */
  const handleCancel = async () => {
  
    setLoading(true); // Shows the loading spinner for the logout process.
    
    try {
      await logoutUser();
      router.replace("/(auth)/landing");
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
      onCancel={handleCancel}
      loading={loading}
    />
  );
}