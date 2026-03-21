import { createContext, useState } from 'react';
import type { User } from '@/entities/user/model/types.ts'

type AuthContextValue = {
    currentUser: User | null;
    isAuthenticated: boolean;
    login: (user: User) => void;
    logout: () => void;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

type Props = {
    children: React.ReactNode;
};

export function AuthProvider({ children }: Props) {
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
