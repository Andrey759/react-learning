import {createContext, useContext, useState} from 'react';
import type { User } from '@/entities/user/model/types.ts'

type AuthContextValue = {
    currentUser: User | null;
    isAuthenticated: boolean;
    login: (user: User) => void;
    logout: () => void;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    const login = (user: User | null) => {
        setCurrentUser(user);
    }

    const logout = () => {
        setCurrentUser(null);
    }

    const value: AuthContextValue = {
        currentUser,
        isAuthenticated: currentUser !== null,
        login,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);

    if (!ctx) {
        throw new Error('useAuth must be used inside AuthProvider');
    }

    return ctx;
}
