import { useState, useEffect, useCallback } from 'react';
import type { UserTask } from '@/entities/task/model/types';
import { fetchTasks, updateTaskStatus } from '@/entities/task/api/taskApi';
import { useAsync } from '@/shared/lib/hooks/useAsync';

export function useTasks() {
    const { data, isLoading, error } = useAsync(fetchTasks);

    const [tasks, setTasks] = useState<UserTask[]>([]);
    const [loadingIds, setLoadingIds] = useState<Set<number>>(new Set());

    useEffect(() => {
        if (data) setTasks(data);
    }, [data]);

    const toggleTask = useCallback((id: number, completed: boolean) => {
        setLoadingIds(prev => new Set(prev).add(id));

        updateTaskStatus(id, !completed).then(() => {
            setTasks(prev => prev.map(task =>
                task.id === id ? { ...task, completed: !completed } : task
            ));
        }).finally(() => {
            setLoadingIds(prev => {
                const next = new Set(prev);
                next.delete(id);
                return next;
            });
        });
    }, []);

    return { tasks, isLoading, error, loadingIds, toggleTask };
}
