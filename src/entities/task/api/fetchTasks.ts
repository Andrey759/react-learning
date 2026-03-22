import type { Task } from '@/entities/task/model/types.ts'
import { AppError } from '@/shared/errors/AppError.ts'

export async function fetchTasks() {
    const response = await fetch('https://jsonplaceholder.typicode.com/todos');
    const data: Task[] = await response.json();

    if (!Array.isArray(data)) {
        throw new AppError('UNEXPECTED_FORMAT');
    }

    return data;
}
