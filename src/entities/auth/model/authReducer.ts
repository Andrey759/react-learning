// src/entities/auth/model/authReducer.ts

export type AuthState =
    | { status: 'idle' }
    | { status: 'loading' }
    | { status: 'authenticated'; email: string; token: string }
    | { status: 'error'; message: string };

export type AuthAction =
    | { type: 'LOGIN_REQUEST' }
    | { type: 'LOGIN_SUCCESS'; payload: { email: string; token: string } }
    | { type: 'LOGIN_FAILURE'; payload: string }
    | { type: 'LOGOUT' };

export const initialAuthState: AuthState = { status: 'idle' };

// @ts-expect-error state не используется, но должен оставаться первым аргументом
export function authReducer(state: AuthState, action: AuthAction): AuthState {
    switch (action.type) {
        case 'LOGIN_REQUEST':
            return { status: 'loading' };

        case 'LOGIN_SUCCESS':
            return {
                status: 'authenticated',
                email: action.payload.email,
                token: action.payload.token,
            };

        case 'LOGIN_FAILURE':
            return { status: 'error', message: action.payload };

        case 'LOGOUT':
            return { status: 'idle' };
    }
}
