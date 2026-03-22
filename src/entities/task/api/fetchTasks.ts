import type { Task, UserTask } from '@/entities/task/model/types.ts'
import type { User } from '@/entities/user/model/types.ts';
import { fetchUsers } from '@/entities/user/api/fetchUsers.ts';
import { AppError } from '@/shared/errors/AppError.ts'

export async function fetchTasks(): Promise<UserTask[]> {
    const [taskData, userData] = await Promise.all([
        fetch('https://jsonplaceholder.typicode.com/todos').then(r => r.json()),
        fetchUsers(),
    ]);

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
