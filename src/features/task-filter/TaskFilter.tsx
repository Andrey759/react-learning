// features/task-filter/TaskFilter.tsx
//
// Сейчас это статическая заготовка — только HTML/CSS.
// Твоя задача: добавить состояние, логику фильтрации и useRef.

function TaskFilter() {
    return (
        <div className="task-filter">
            <div className="task-filter__search">
                <input
                    type="text"
                    className="task-filter__input"
                    placeholder="Поиск по названию..."
                />
                {/* Подсказка: сюда придёт кнопка "Очистить" — хорошее место для useRef на input */}
            </div>
            <div className="task-filter__tabs" role="group" aria-label="Фильтр по статусу">
                <button type="button" className="task-filter__tab task-filter__tab--active">
                    Все
                </button>
                <button type="button" className="task-filter__tab">
                    Активные
                </button>
                <button type="button" className="task-filter__tab">
                    Завершённые
                </button>
            </div>
        </div>
    );
}

export default TaskFilter;
