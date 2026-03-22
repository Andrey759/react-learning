// src/entities/task/model/types.ts
import type { User } from '@/entities/user/model/types.ts';

export type Task = {
    userId: number;
    id: number;
    title: string;
    completed: boolean;
};

export type UserTask = Omit<Task, 'userId'> & {
    user: User | null;
};

export type FilterTab = 'ALL' | 'ACTIVE' | 'COMPLETED';
