import { useState } from "react";
import { sendPasswordReset, getFriendlyError } from "@/services/authService";

// Manages the password reset logic for the Hobart user.
export function useForgotPassword() {
  
  // Stores a boolean in the loading var to track the email sending status.
  const [loading, setLoading] = useState(false);
  
  // Stores the instructions for sending a reset link in the handleSendReset var.
  const handleSendReset = async (email: string) => {
    
    // Checks if the email var is empty or missing an '@' symbol.
    if (!email || !email.includes("@")) {
      throw new Error("Please enter a valid email address.");
    }
    
    // setLoading function changes the loading var to true
    // while the email is being sent.
    setLoading(true);
    
    try {
      await sendPasswordReset(email);
    } catch (e: any) {
      throw new Error(getFriendlyError(e));
    } finally {
      // setLoading function changes loading var
      // to false once the email process is over.
      setLoading(false);
    }
  };
  // Passes the values of loading and handleSendReset back to the route.
  return { loading, handleSendReset };
}