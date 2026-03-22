import type { FilterTab } from '@/entities/task/model/types.ts';

type TaskFilterProps = {
    filterText: string;
    onFilterTextChange: (value: string) => void;
    activeTab: FilterTab;
    onTabChange: (tab: FilterTab) => void;
};

function TaskFilter(props: TaskFilterProps): React.ReactElement {
    return (
        <div className="task-filter">
            <div className="task-filter__search">
                <input
                    type="text"
                    className="task-filter__input"
                    placeholder="Поиск по названию..."
                    value={props.filterText}
                    onChange={(event) => props.onFilterTextChange(event.target.value)}
                />
                {/* Подсказка: сюда придёт кнопка "Очистить" — хорошее место для useRef на input */}
            </div>
            <div className="task-filter__tabs" role="group" aria-label="Фильтр по статусу">
                <button type="button"
                        className={`task-filter__tab ${props.activeTab === 'ALL' && 'task-filter__tab--active'}`}
                        onClick={() => props.onTabChange('ALL')}>
                    Все
                </button>
                <button type="button"
                        className={`task-filter__tab ${props.activeTab === 'ACTIVE' && 'task-filter__tab--active'}`}
                        onClick={() => props.onTabChange('ACTIVE')}>
                    Активные
                </button>
                <button type="button"
                        className={`task-filter__tab ${props.activeTab === 'COMPLETED' && 'task-filter__tab--active'}`}
                        onClick={() => props.onTabChange('COMPLETED')}>
                    Завершённые
                </button>
            </div>
        </div>
    );
}

export default TaskFilter;
