/**
 * FORGOT PASSWORD HOOK
 * A logic hook for managing the password recovery request.
 * Encapsulates validation, loading states, and error handling for 
 * triggering the Firebase reset email independently of the UI.
 */
import { useState } from "react";
import { sendPasswordReset, getFriendlyError } from "@/services/authService";

export function useForgotPassword() {
/**
 ** A logic hook for managing the password recovery request.
 * 
 ** Outcome: 
 * Provides a unified interface for email validation, loading states, 
 * and Firebase communication to trigger reset emails independently of the UI.
 */
  const [loading, setLoading] = useState(false);   // Stores true/false value to track the email sending status.
  
  const handleSendReset = async (email: string) => {
  /**
  ** Validates the email and triggers the reset flow.
  *
  ** Parameters:
  *email - The string address provided by the user.
  * 
  ** Outcome:
  * Requests a reset link from Firebase and manages the internal loading state.
  */
    
    // Checks if the email var is empty or missing an '@' symbol.
    if (!email || !email.includes("@")) {
      throw new Error("Please enter a valid email address.");
    }
    
    setLoading(true); // Value set to true while email is being sent.
    
    try {
      await sendPasswordReset(email);
    } catch (e: any) {
      throw new Error(getFriendlyError(e));
    } finally {
      setLoading(false); // Value set to false once email has been sent.
    }
  };
  
  // Passes the values of loading and handleSendReset back to the route.
  return { loading, handleSendReset };
}