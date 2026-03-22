
// src/entities/task/model/types.ts
export type Task = {
    userId: number;
    id: number;
    title: string;
    completed: boolean;
};

export type FilterTab = 'ALL' | 'ACTIVE' | 'COMPLETED';
