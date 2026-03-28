import type { FilterTab } from '@/entities/task/model/types.ts';
import { logger } from '@/shared/lib/logger.ts';

type TaskFilterProps = {
    filterText: string;
    onFilterTextChange: (value: string) => void;
    activeTab: FilterTab;
    onTabChange: (tab: FilterTab) => void;
};

function TaskFilter({ filterText, onFilterTextChange, activeTab, onTabChange }: TaskFilterProps): React.ReactElement {
    const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        logger.info('User action:', { action: 'filter-text-change', value: event.target.value });
        onFilterTextChange(event.target.value);
    };

    const handleTabChange = (tab: FilterTab) => {
        logger.info('Button click:', { action: 'filter-tab-change', tab });
        onTabChange(tab);
    };

    return (
        <div className="task-filter">
            <div className="task-filter__search">
                <input
                    type="text"
                    className="task-filter__input"
                    placeholder="Поиск по названию..."
                    value={filterText}
                    onChange={handleTextChange}
                />
                {/* Подсказка: сюда придёт кнопка "Очистить" — хорошее место для useRef на input */}
            </div>
            <div className="task-filter__tabs" role="group" aria-label="Фильтр по статусу">
                <button type="button"
                        className={`task-filter__tab ${activeTab === 'ALL' && 'task-filter__tab--active'}`}
                        onClick={() => handleTabChange('ALL')}>
                    Все
                </button>
                <button type="button"
                        className={`task-filter__tab ${activeTab === 'ACTIVE' && 'task-filter__tab--active'}`}
                        onClick={() => handleTabChange('ACTIVE')}>
                    Активные
                </button>
                <button type="button"
                        className={`task-filter__tab ${activeTab === 'COMPLETED' && 'task-filter__tab--active'}`}
                        onClick={() => handleTabChange('COMPLETED')}>
                    Завершённые
                </button>
            </div>
        </div>
    );
}

export default TaskFilter;
