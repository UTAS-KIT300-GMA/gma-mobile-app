import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Alert } from 'react-native';
import { auth, getFriendlyError } from '@/services/authService';
import { VerifyUI } from '@/screens/auth/verify-user-screen';

export default function VerifyRoute() {
/**
* Logic for verify-user-screen.
 * 
 * Outcome:
 * Monitors the user's email verification status and handles
 * manual checks, resending links, and logging out.
*/
  
  // Stores the navigation object from Expo Router in router var to allow moving between the (auth) screens.
  const router = useRouter();

  // Stores a boolean (true/false) in the checking var to track if the app is currently reloading user status.
  const [checking, setChecking] = useState(false);
  
  // Stores the string typed by the user in the code var for visual feedback on the keypad.
  const [code, setCode] = useState('');
  
  // Retrieves the user's account from Firebase Auth and stores it in user var.
  const user = auth.currentUser;

  // Automatically checks user's verification status every 4 seconds.
  useEffect(() => {
    const interval = setInterval(async () => {
      if (user) {
        try {
          await user.reload();
          
          //If user is verified the timer stops and user is sent to home screen.
          if (user.emailVerified) {
            clearInterval(interval);
            router.replace('/(tabs)/' as any);
          }
        } catch (e) {
          console.error("Auto-reload failed", e);
        }
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [user]);
  
  // Stores the function instructions in the handleKeyPress var.
  const handleKeyPress = async (val: string) => {
    if (val === '<') {
      // Deletes the last character stored in the code var.
      setCode(prev => prev.slice(0, -1));
    } else if (code.length < 5) {
      const newCode = code + val;
      setCode(newCode);

      if (newCode.length === 5) {
        setChecking(true);
        try {
          if (user) {
            await user.reload();
            if (user.emailVerified) {
              router.replace('/' as any);
            } else {
              Alert.alert("Not Verified", "We haven't seen the link click yet. Please check your inbox!");
              setCode(''); 
            }
          }
        } catch (e) {
          Alert.alert("Error", "Could not check status. Please try again.");
        } finally {
          setChecking(false);
        }
      }
    }
  };
  
  // Stores the function instructions in the handleResend var.
  const handleResend = async () => {
    if (user) {
      try {
        await user.sendEmailVerification();
        Alert.alert("Sent!", "A fresh verification link is on its way.");
      } catch (e: any) {
        Alert.alert("Wait a moment", getFriendlyError(e));
      }
    }
  };
  
  // Stores the function instructions in the handleLogout var.
  const handleLogout = async () => {
    try {
      // Ends the active session
      await auth.signOut();
      
    } catch (e) {
      router.replace('/landing' as any);
    }
  };

  return (
    // Passes the values of code, email, checking, handleKeyPress
    // handleResend and handleLogout to verify-user-screen.
    <VerifyUI 
      code={code}
      email={user?.email || "your email"}
      onKeyPress={handleKeyPress}
      onResend={handleResend}
      onLogout={handleLogout}
      loading={checking} 
    />
  );
} 