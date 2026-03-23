import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { getFriendlyError, getPasswordResetEmail, resetPasswordWithCode } from "@/services/authService";
import { ResetPasswordScreen } from "@/screens/auth/reset-password-screen";

export default function ResetPasswordRoute() {
  // Stores the navigation object from Expo Router in router var to allow moving between the (auth) screens.
  const router = useRouter();

  // Expo Router grabs the 'oobCode' from the URL 
  const params = useLocalSearchParams<{ oobCode?: string }>();
  
  const oobCode = useMemo(() => {
    const raw = params?.oobCode;
    return typeof raw === "string" ? raw : undefined;
  }, [params?.oobCode]);

  const [loading, setLoading] = useState(false);
  const [checkingCode, setCheckingCode] = useState(false);
  const [resetEmail, setResetEmail] = useState<string | null>(null);
  
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  
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

  const handleSave = async (newPass: string, confirmPass: string, manualCode?: string) => {
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
    setModalMessage(msg);
    setIsSuccess(success);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    // 3. Navigation Fix: If successful, send them to the login screen
    if (isSuccess) {
      router.replace("/login" as any);
    }
  };

  return (
    // Passes the values of oobCode, resetEmail, checkingCode, loading, handleSave,
    // modalVisible, modalMessage and handleCloseModal to the resetpassword screen.
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