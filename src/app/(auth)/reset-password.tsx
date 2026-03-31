/**
  **PASSWORD RESET ROUTE**
 * This file handles the logic for changing a password for the reset password UI. 
 * It takes the link from the user's email, makes sure it’s real, 
 * and then saves the new password to the database.
 */
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { getFriendlyError, getPasswordResetEmail, resetPasswordWithCode } from "@/services/authService";
import { ResetPasswordScreen } from "@/screens/auth/reset-password-screen";

/**
 * Sets up the logic for the password reset UI.
 * * Outcome: 
 * Validates the reset code from the URL and manages the password update state.
 */
export default function ResetPasswordRoute() {
  
  const router = useRouter();                                  // Stores the navigation tool to allow moving between screens.
  const params = useLocalSearchParams<{ oobCode?: string }>(); // Stores the reset code from the email link.
  
  // Stores "cleaned" code in string format, so app can use link.
  const oobCode = useMemo(() => {
    const raw = params?.oobCode;
    return typeof raw === "string" ? raw : undefined;
  }, [params?.oobCode]);

  const [loading, setLoading] = useState(false);                     // Stores, true/false value to track if the new password is being saved.
  const [checkingCode, setCheckingCode] = useState(false);           // Stores, true/false value to track if app is still checking email link.
  const [resetEmail, setResetEmail] = useState<string | null>(null); // Stores user's email, as to display to user what acoount they are reseting password for.
  const [modalVisible, setModalVisible] = useState(false);           // Stores a true/false value in modalVisible to track if the message popup is showing.
  const [modalMessage, setModalMessage] = useState("");              // Stores message for feedback popup.
  const [isSuccess, setIsSuccess] = useState(false);                 // Stores true/false value, to track if password was changed successfully.

  /**
  ** Checks if the reset link from the email is still valid.
  * 
  ** Outcome: 
  * Retrieves the user's email if the link works, otherwise it shows an error.
  */
  useEffect(() => {
  
    // Exit if no reset code is found in the URL.
    if (!oobCode) return;
    
    setCheckingCode(true); // Shows a spinner while verifying the link.
    
    // Asks Firebase who this reset link belongs to.
    getPasswordResetEmail(oobCode)
      .then((email: string) => setResetEmail(email))
      .catch((e: any) =>  triggerModal(getFriendlyError(e), false))
      .finally(() => setCheckingCode(false));
  }, [oobCode]);

  /**
   ** Saves the new password the user typed in.
   *
   ** Parameters:
   * @param newPass - the new password entered
   * @param confirmPass - the second time the password was entered
   * 
   ** Outcome: 
   *Updates the password in the database and shows a success or error message.
   */
  const handleSave = async (newPass: string, confirmPass: string, manualCode?: string) => {
    
    const effectiveCode = oobCode ?? manualCode?.trim(); // Stores reset code by checking email link first, or using the typed-in code if the link is missing.

    // Validates inputs before attempting the update.
    if (!effectiveCode) {
      triggerModal("Please provide a valid reset code.", false);
      return;
    }
    if (newPass.length < 8) {
      triggerModal("Password must be at least 8 characters.", false);
      return;
    }
    if (newPass !== confirmPass) {
      triggerModal("Passwords do not match.", false);
      return;
    }

    // Toggles the loading spinner to show the user a background task is running.
    setLoading(true);
    try {
      await resetPasswordWithCode(effectiveCode, newPass); 
      triggerModal("Your password has been updated! You can now log in.", true);
    } catch (e) {
      triggerModal(getFriendlyError(e), false);
    } finally {
      setLoading(false);
    }
  };

  const triggerModal = (msg: string, success: boolean) => {
  /**
   **  Sets up the message popup details.
   *
   ** Parameters:
   * msg - the text to show the user
   * success - if the task worked or not
   * 
   ** Outcome: 
   * Fills the popup with the message and makes it visible.
   */
    setModalMessage(msg);
    setIsSuccess(success);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
  /**
  ** Closes the message popup.
  *
  ** Outcome: 
  * Hides the popup and, if the password was saved, 
  * sends the user back to the login screen.
  */ 
    setModalVisible(false);
    if (isSuccess) {
      router.replace("/login" as any);
    }
  };

  // Passes reset logic and current state to the Reset Password UI.
  return (
    <ResetPasswordScreen 
      oobCode={oobCode}
      resetEmail={resetEmail}
      checkingCode={checkingCode}
      loading={loading}
      onSave={handleSave}
      modalVisible={modalVisible}
      modalMessage={modalMessage}
      onCloseModal={handleCloseModal}
    />
  );
}