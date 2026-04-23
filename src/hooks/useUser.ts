import { useEffect, useMemo, useState } from "react";
import { onSnapshot } from "@react-native-firebase/firestore";
import { auth, db, doc } from "@/services/authService";
import type { UserDoc } from "@/types/type";

type UseUserState = {
  userDoc: UserDoc | null;
  loading: boolean;
  error: string | null;
};

export function useUser(): UseUserState {
  const [userDoc, setUserDoc] = useState<UserDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const uid = auth.currentUser?.uid;

    // Not signed in (or auth not ready yet): expose empty state.
    if (!uid) {
      setUserDoc(null);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    const userRef = doc(db, "users", uid);
    const unsubscribe = onSnapshot(
      userRef,
      (snap) => {
        const data = snap.data() as Partial<UserDoc> | undefined;
        if (!snap.exists() || !data) {
          setUserDoc(null);
          setLoading(false);
          return;
        }

        setUserDoc({
          email: String(data.email ?? ""),
          firstName: String(data.firstName ?? ""),
          lastName: String(data.lastName ?? ""),
          gender: (data.gender as any) ?? null,
          dateOfBirth: (data.dateOfBirth as any) ?? null,
          role: String(data.role ?? "general"),
          selectedTags: Array.isArray(data.selectedTags)
            ? (data.selectedTags as unknown[]).filter((t) => typeof t === "string") as string[]
            : [],
          onboardingComplete: Boolean(data.onboardingComplete ?? false),
          createdAt: (data.createdAt as any) ?? null,
          photoURL: typeof data.photoURL === "string" ? data.photoURL : undefined,
          authProvider:
            typeof data.authProvider === "string" ? data.authProvider : undefined,
        });
        setLoading(false);
      },
      (e: any) => {
        setUserDoc(null);
        setLoading(false);
        setError(e?.message ?? "Failed to load user profile.");
      },
    );

    return () => unsubscribe();
  }, []);

  return useMemo(
    () => ({
      userDoc,
      loading,
      error,
    }),
    [userDoc, loading, error],
  );
}

