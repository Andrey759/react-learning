import type { User } from '@/entities/user/model/types.ts'
import { AppError } from '@/shared/errors/AppError.ts'
import { logger } from '@/shared/lib/logger.ts';

export async function fetchUsers() {
    const url = 'https://jsonplaceholder.typicode.com/users';

    logger.debug('Request:', { url, method: 'GET', headers: {}, body: undefined });

    const response = await fetch(url);
    const data: User[] = await response.json();

    logger.debug('Response:', {
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        body: data,
    });

    if (!Array.isArray(data)) {
        throw new AppError('UNEXPECTED_FORMAT');
    }

    return data;
}
