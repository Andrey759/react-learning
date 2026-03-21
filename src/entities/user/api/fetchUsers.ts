import type { User } from '@/entities/user/model/types.ts'
import { AppError } from '@/shared/errors/AppError.ts'

export async function fetchUsers() {
    const response = await fetch('https://jsonplaceholder.typicode.com/users');
    const data: User[] = await response.json();

    if (!Array.isArray(data)) {
        throw new AppError('UNEXPECTED_FORMAT');
    }

    return data;
}
