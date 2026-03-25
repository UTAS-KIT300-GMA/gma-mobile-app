/**
 * PASSWORD RESET MANAGER
 * This file handles the very last step of changing a password. 
 * It takes the special link from the user's email, makes sure it’s real, 
 * and then saves the new password to the database.
 */
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { getFriendlyError, getPasswordResetEmail, resetPasswordWithCode } from "@/services/authService";
import { ResetPasswordScreen } from "@/screens/auth/reset-password-screen";

export default function ResetPasswordRoute() {
  
  /* Stores the navigation tool in the router var,
     to allow moving between the (auth) screens.*/
  const router = useRouter();

    /* Stores the special code from the email link,
       in the params var to identify the user.*/
  const params = useLocalSearchParams<{ oobCode?: string }>();
  
  /* Stores the "cleaned" code in the oobCode var,
     so the app can use it safely.*/
  const oobCode = useMemo(() => {
    const raw = params?.oobCode;
    return typeof raw === "string" ? raw : undefined;
  }, [params?.oobCode]);

  /* Stores a true/false value in the loading var
   to track if the new password is being saved.*/
  const [loading, setLoading] = useState(false);

  /* Stores a true/false value in checkingCode to track
     if the app is still checking the email link.*/
  const [checkingCode, setCheckingCode] = useState(false);

  // Stores the user's email address in the resetEmail var so they know which account they are fixing.
  const [resetEmail, setResetEmail] = useState<string | null>(null);
  
  // Stores a true/false value in modalVisible to track if the message popup is showing.
  const [modalVisible, setModalVisible] = useState(false);

  // Stores the text message in modalMessage to show the user what happened.
  const [modalMessage, setModalMessage] = useState("");

  // Stores a true/false value in isSuccess to track if the password was changed successfully.
  const [isSuccess, setIsSuccess] = useState(false);

  /** * Checks if the reset link from the email is still valid.
   * * Outcome: 
   * Retrieves the user's email if the link works, otherwise it shows an error.
   */
  useEffect(() => {
    if (!oobCode) return;
    setCheckingCode(true);
    getPasswordResetEmail(oobCode)
      
      .then((email: string) => setResetEmail(email))
      .catch((e: any) => { 
        triggerModal(getFriendlyError(e), false);
})
      .finally(() => setCheckingCode(false));
  }, [oobCode]);


  /** * Saves the new password the user typed in.
   * * Parameters:
   * newPass - the new password entered
   * confirmPass - the second time the password was entered
   * * Outcome: 
   * Updates the password in the database and shows a success or error message.
   */
  const handleSave = async (newPass: string, confirmPass: string, manualCode?: string) => {
    
    /*Stores the final reset code by checking the email link first, 
      or using the typed-in code if the link is missing.*/
    const effectiveCode = oobCode ?? manualCode?.trim();

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

    /* Changes the loading var to true to tell the app a background task
       has started and to show a loading spinner.*/
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


  /** * Sets up the message popup details.
   * * Parameters:
   * msg - the text to show the user
   * success - if the task worked or not
   * * Outcome: 
   * Fills the popup with the message and makes it visible.
   */
  const triggerModal = (msg: string, success: boolean) => {
    setModalMessage(msg);
    setIsSuccess(success);
    setModalVisible(true);
  };


  /** * Closes the message popup.
   * * Outcome: 
   * Hides the popup and, if the password was saved, 
   * sends the user back to the login screen.
   */
  const handleCloseModal = () => {
    setModalVisible(false);
    if (isSuccess) {
      router.replace("/login" as any);
    }
  };

  /* Passes the reset code, email info 
     and all button actions to the reset password screen UI.*/
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