import { useState, useEffect, useMemo, useCallback } from 'react';
import TaskFilter from '@/widgets/task-filter/TaskFilter.tsx';
import TaskCard from '@/widgets/task-list/TaskCard.tsx';
import type { UserTask } from '@/entities/task/model/types.ts';
import { fetchTasks, updateTaskStatus } from '@/entities/task/api/taskApi.ts';
import { AppError } from '@/shared/errors/AppError.ts';
import { ERROR_MESSAGES } from '@/shared/errors/errorMessages.ts';
import { useTaskFilter } from '@/app/providers/TaskFilterProvider.tsx';

function TasksPage() {
    const [tasks, setTasks] = useState<UserTask[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>();

    const { filterText, setFilterText, activeTab, setActiveTab } = useTaskFilter();

    useEffect(() => {
        fetchTasks()
            .then(setTasks)
            .catch(e => setError(e instanceof AppError ? e.message : ERROR_MESSAGES.NETWORK_ERROR))
            .finally(() => setIsLoading(false));
    }, []);

    const matchesTab = (task: UserTask): boolean => {
        switch (activeTab) {
            case 'ACTIVE':    return !task.completed;
            case 'COMPLETED': return task.completed;
            default:          return true;
        }
    }
    const matchesText = (task: UserTask): boolean =>
        !filterText || task.title.toLowerCase().includes(filterText.toLowerCase());

    const taskFilter = (task: UserTask) => matchesText(task) && matchesTab(task);

    const filteredTasks = useMemo(
        () => tasks.filter(taskFilter),
        [tasks, filterText, activeTab]
    );

    const [loadingIds, setLoadingIds] = useState<Set<number>>(new Set());

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


    if (isLoading) {
        return (
            <div className="dashboard">
                <h2 className="dashboard__title">Задачи</h2>
                <div className="dashboard__status">Загрузка...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard">
                <h2 className="dashboard__title">Задачи</h2>
                <div className="dashboard__status dashboard__status--error">Ошибка: {error}</div>
            </div>
        );
    }

    return (
        <div className="dashboard">
            <div className="dashboard__header">
                <h2 className="dashboard__title">Задачи</h2>
                <div className="dashboard__meta">{filteredTasks.length} элементов</div>
            </div>

            <TaskFilter
                filterText={filterText}
                onFilterTextChange={setFilterText}
                activeTab={activeTab}
                onTabChange={setActiveTab}
            />

            <div className="dashboard__list" role="list">
                {filteredTasks.map(task => (
                    <TaskCard
                        key={task.id}
                        task={task}
                        highlight={filterText}
                        onToggle={toggleTask}
                        isLoading={loadingIds.has(task.id)}
                    />
                ))}
            </div>
        </div>
    );
}

export default TasksPage;
