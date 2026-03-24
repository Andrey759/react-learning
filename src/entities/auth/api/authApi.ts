// src/entities/auth/api/authApi.ts
import { AppError } from '@/shared/errors/AppError.ts';

export type LoginResponse = { token: string };

export async function loginRequest(email: string, password: string): Promise<LoginResponse> {
    let response: Response;

    try {
        response = await fetch('https://reqres.in/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-api-key': import.meta.env.VITE_API_KEY },
            body: JSON.stringify({ email, password }),
        });
    } catch {
        throw new AppError('NETWORK_ERROR');
    }

    if (!response.ok) {
        throw new AppError('AUTHENTICATION_ERROR');
    }

    return response.json();
}
