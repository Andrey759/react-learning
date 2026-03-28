import { AppError } from '@/shared/errors/AppError.ts';
import { logger } from '@/shared/lib/logger.ts';

export type LoginResponse = { token: string };

export async function loginRequest(email: string, password: string): Promise<LoginResponse> {
    const url = 'https://reqres.in/api/login';
    const method = 'POST';
    const headers = { 'Content-Type': 'application/json', 'x-api-key': import.meta.env.VITE_API_KEY };
    const body = { email, password };

    logger.debug('Request:', { url, method, headers, body });

    let response: Response;

    try {
        response = await fetch(url, {
            method,
            headers,
            body: JSON.stringify(body),
        });
    } catch {
        throw new AppError('NETWORK_ERROR');
    }

    const responseBody = await response.clone().json().catch(() => null);

    logger.debug('Response:', {
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        body: responseBody,
    });

    if (!response.ok) {
        throw new AppError('AUTHENTICATION_ERROR');
    }

    return responseBody as LoginResponse;
}
