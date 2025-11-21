// /modules/auth/ui/auth-provider.tsx
import { useStorageValue } from "@/modules/shared/ui/hooks/use-storage-value";
import { authStorage } from "@/modules/auth/auth.storage";
import { createContext, useContext, useEffect } from "react";
import { useAuthQueries } from "./use-auth-queries";


interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_EMAIL = import.meta.env.VITE_AUTH_EMAIL;
const AUTH_PASSWORD = import.meta.env.VITE_AUTH_PASSWORD;

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const { useLogin } = useAuthQueries();
    const { mutateAsync: login } = useLogin();
    const { value: session, isLoading } = useStorageValue(authStorage.session);    
    const isAuthenticated = !!session?.access_token;

    useEffect(() => {
        console.log('isAuthenticated', isAuthenticated);
        if (!isAuthenticated) {
            console.log('logging in', AUTH_EMAIL, AUTH_PASSWORD);
            login({ email: AUTH_EMAIL, password: AUTH_PASSWORD });
        }
    }, [isAuthenticated])

    return (
        <AuthContext.Provider value={{ 
            isAuthenticated, 
            isLoading,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}