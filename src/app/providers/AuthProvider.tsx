// src/app/providers/AuthProvider.tsx

import { createContext, useContext, useReducer, type ReactNode } from 'react';
import { authReducer, initialAuthState, type AuthAction, type AuthState } from '@/entities/auth/model/authReducer.ts';
import { loginRequest } from '@/entities/auth/api/authApi.ts';
import { logger } from '@/shared/lib/logger.ts';

type AuthContextValue = {
    state: AuthState;
    dispatch: React.Dispatch<AuthAction>;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(authReducer, initialAuthState);

    const login = async (email: string, password: string) => {
        dispatch({ type: 'LOGIN_REQUEST' });
        try {
            const data = await loginRequest(email, password);
            dispatch({ type: 'LOGIN_SUCCESS', payload: { email, token: data.token } });
        } catch (e) {
            logger.error('Login failed:', e);
            dispatch({
                type: 'LOGIN_FAILURE',
                payload: e instanceof Error ? e.message : 'Неизвестная ошибка',
            });
        }
    };

    const logout = () => dispatch({ type: 'LOGOUT' });

    return (
        <AuthContext.Provider value={{ state, dispatch, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
