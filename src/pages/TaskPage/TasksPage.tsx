import { useState, useEffect } from "react";
import TaskFilter from '@/widgets/task-filter/TaskFilter.tsx';
import HighlightText from '@/shared/ui/HighlightText.tsx';
import type { UserTask } from "@/entities/task/model/types.ts";
import { fetchTasks } from "@/entities/task/api/fetchTasks.ts";
import { AppError } from "@/shared/errors/AppError.ts";
import { ERROR_MESSAGES } from "@/shared/errors/errorMessages.ts";
import { useTaskFilter } from "@/app/providers/TaskFilterProvider.tsx";

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

    const filteredTasks = tasks.filter(taskFilter);

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
                    <div key={task.id} className="task-card" role="listitem">
                        <div className="task-card__main">
                            <span
                                className={`task-card__status ${task.completed ? 'task-card__status--done' : 'task-card__status--todo'}`}
                            >
                                {task.completed ? '✓' : '○'}
                            </span>
                            <span className={`task-card__title ${task.completed ? 'task-card__title--done' : ''}`}>
                                <HighlightText text={task.title} highlight={filterText} />
                            </span>
                        </div>
                        <div className="task-card__user">@{task.user?.username}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default TasksPage;
