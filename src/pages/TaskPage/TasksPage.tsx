import { useMemo } from 'react';
import TaskFilter from '@/widgets/task-filter/TaskFilter.tsx';
import TaskCard from '@/widgets/task-list/TaskCard.tsx';
import type { UserTask } from '@/entities/task/model/types.ts';
import { useTasks } from '@/entities/task/hooks/useTasks.ts';
import { useTaskFilter } from '@/app/providers/TaskFilterProvider.tsx';

function TasksPage() {
    const { tasks, isLoading, error, loadingIds, toggleTask } = useTasks();
    const { filterText, setFilterText, activeTab, setActiveTab } = useTaskFilter();

    const filteredTasks = useMemo(() => {
        const matchesTab = (task: UserTask): boolean => {
            switch (activeTab) {
                case 'ACTIVE':    return !task.completed;
                case 'COMPLETED': return task.completed;
                default:          return true;
            }
        };
        const matchesText = (task: UserTask): boolean =>
            !filterText || task.title.toLowerCase().includes(filterText.toLowerCase());

        return tasks.filter(task => matchesText(task) && matchesTab(task));
    }, [tasks, filterText, activeTab]);

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
