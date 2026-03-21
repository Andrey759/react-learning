// Статическая заготовка страницы задач.
// Загрузку данных (fetchTasks, useEffect, useState) реализуй сам.
import TaskFilter from '@/features/task-filter/TaskFilter.tsx';

// Временные статические данные — потом заменишь на загрузку из API
const MOCK_TASKS = [
    { id: 1, title: 'Установить зависимости проекта', completed: true, username: 'Bret' },
    { id: 2, title: 'Изучить хук useState', completed: true, username: 'Antonette' },
    { id: 3, title: 'Разобраться с useEffect и fetch', completed: false, username: 'Samantha' },
    { id: 4, title: 'Реализовать контекст авторизации', completed: false, username: 'Karianne' },
    { id: 5, title: 'Добавить фильтрацию задач', completed: false, username: 'Kamren' },
];

function TasksPage() {
    return (
        <div className="dashboard">
            <div className="dashboard__header">
                <h2 className="dashboard__title">Задачи</h2>
                <div className="dashboard__meta">{MOCK_TASKS.length} элементов</div>
            </div>

            <TaskFilter />

            <div className="dashboard__list" role="list">
                {MOCK_TASKS.map((task) => (
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
                        <div className="task-card__user">@{task.username}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default TasksPage;
