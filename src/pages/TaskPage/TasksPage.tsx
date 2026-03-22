import { useState, useEffect } from "react";
import TaskFilter from '@/widgets/task-filter/TaskFilter.tsx';
import type { Task } from "@/entities/task/model/types.ts";
import { fetchTasks } from "@/entities/task/api/fetchTasks.ts";
import { AppError } from "@/shared/errors/AppError.ts";
import { ERROR_MESSAGES } from "@/shared/errors/errorMessages.ts";
import {useTaskFilter} from "@/app/providers/TaskFilterProvider.tsx";

function TasksPage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>();

    const { filterText, setFilterText, activeTab, setActiveTab } = useTaskFilter();

    useEffect(() => {
        fetchTasks()
            .then(setTasks)
            .catch(e => setError(e instanceof AppError ? e.message : ERROR_MESSAGES.NETWORK_ERROR))
            .finally(() => setIsLoading(false));
    }, []);

    const matchesTab = (task: Task): boolean => {
        switch (activeTab) {
            case 'ACTIVE':    return !task.completed;
            case 'COMPLETED': return task.completed;
            default:          return true;
        }
    }
    const matchesText = (task: Task): boolean =>
        !filterText || task.title.toLowerCase().includes(filterText.toLowerCase());

    const taskFilter = (task: Task) => matchesText(task) && matchesTab(task);

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
                <div className="dashboard__meta">{tasks.length} элементов</div>
            </div>

            <TaskFilter
                filterText={filterText}
                onFilterTextChange={setFilterText}
                activeTab={activeTab}
                onTabChange={setActiveTab}
            />

            <div className="dashboard__list" role="list">
                {tasks.filter(taskFilter).map(task => (
                    <div key={task.id} className="task-card" role="listitem">
                        <div className="task-card__main">
                            <span
                                className={`task-card__status ${task.completed ? 'task-card__status--done' : 'task-card__status--todo'}`}
                            >
                                {task.completed ? '✓' : '○'}
                            </span>
                            <span className={`task-card__title ${task.completed ? 'task-card__title--done' : ''}`}>
                                {task.title}
                            </span>
                        </div>
                        <div className="task-card__user">@{task.userId}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default TasksPage;
