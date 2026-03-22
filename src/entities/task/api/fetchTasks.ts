import type { Task, UserTask } from '@/entities/task/model/types.ts'
import type { User } from "@/entities/user/model/types.ts";
import { fetchUsers } from "@/entities/user/api/fetchUsers.ts";
import { AppError } from '@/shared/errors/AppError.ts'

export async function fetchTasks() {
    const taskResponse = await fetch('https://jsonplaceholder.typicode.com/todos');
    const taskData: Task[] = await taskResponse.json();

    if (!Array.isArray(taskData)) {
        throw new AppError('UNEXPECTED_FORMAT');
    }

    const userData: User[] = await fetchUsers();

    const userMap = new Map(userData.map(u => [u.id, u]));

    return taskData.map((task: Task): UserTask => ({
        id: task.id,
        title: task.title,
        completed: task.completed,
        user: userMap.get(task.userId) ?? null,
    }));
}
