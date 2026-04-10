import React, { createContext, useContext } from "react";
import { useUser } from "@/hooks/useUser"; // Your existing hook
import type { UserDoc } from "@/types/type";

type UserContextType = {
    userDoc: UserDoc | null;
    loading: boolean;
    error: string | null;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
    const userData = useUser(); // The hook runs ONCE here

    return (
        <UserContext.Provider value={userData}>
            {children}
        </UserContext.Provider>
    );
};

// Custom hook to consume the context
export const useAuthUser = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error("useAuthUser must be used within a UserProvider");
    }
    return context;
};