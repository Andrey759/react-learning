import type { Task, UserTask } from '@/entities/task/model/types.ts'
import type { User } from '@/entities/user/model/types.ts';
import { fetchUsers } from '@/entities/user/api/fetchUsers.ts';
import { AppError } from '@/shared/errors/AppError.ts'
import { logger } from '@/shared/lib/logger.ts';

export async function fetchTasks(): Promise<UserTask[]> {
    const tasksUrl = 'https://jsonplaceholder.typicode.com/todos';

    logger.debug('Request:', { url: tasksUrl, method: 'GET', headers: {}, body: undefined });

    const [taskResponse, userData] = await Promise.all([
        fetch(tasksUrl),
        fetchUsers(),
    ]);

    const taskData = await taskResponse.json();

    logger.debug('Response:', {
        status: taskResponse.status,
        headers: Object.fromEntries(taskResponse.headers.entries()),
        body: taskData,
    });

    if (!Array.isArray(taskData) || !Array.isArray(userData)) {
        throw new AppError('UNEXPECTED_FORMAT');
    }

    const userMap = new Map(userData.map((u: User) => [u.id, u]));

    return taskData.map((task: Task): UserTask => ({
        id: task.id,
        title: task.title,
        completed: task.completed,
        user: userMap.get(task.userId) ?? null,
    }));
}

export async function updateTaskStatus(id: number, completed: boolean): Promise<void> {
    const url = `https://jsonplaceholder.typicode.com/todos/${id}`;
    const method = 'PATCH';
    const headers = { 'Content-Type': 'application/json' };
    const body = { completed };

    logger.debug('Request:', { url, method, headers, body });

    const response = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(body),
    });

    const responseBody = await response.clone().json().catch(() => null);

    logger.debug('Response:', {
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        body: responseBody,
    });
}
