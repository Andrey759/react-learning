// src/entities/auth/api/authApi.ts

export type LoginResponse = { token: string };

export async function loginRequest(email: string, password: string): Promise<LoginResponse> {
    const response = await fetch('https://reqres.in/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': import.meta.env.VITE_API_KEY },
        body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? 'Ошибка авторизации');
    }

    return response.json();
}
