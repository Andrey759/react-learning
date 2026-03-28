import { useTranslation } from 'react-i18next';
import type { FilterTab } from '@/entities/task/model/types.ts';
import { logger } from '@/shared/lib/logger.ts';

type TaskFilterProps = {
    filterText: string;
    onFilterTextChange: (value: string) => void;
    activeTab: FilterTab;
    onTabChange: (tab: FilterTab) => void;
};

function TaskFilter({ filterText, onFilterTextChange, activeTab, onTabChange }: TaskFilterProps): React.ReactElement {
    const { t } = useTranslation('common');

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
                    placeholder={t('filter.searchPlaceholder')}
                    value={filterText}
                    onChange={handleTextChange}
                />
            </div>
            <div className="task-filter__tabs" role="group" aria-label={t('filter.statusGroup')}>
                <button type="button"
                        className={`task-filter__tab ${activeTab === 'ALL' && 'task-filter__tab--active'}`}
                        onClick={() => handleTabChange('ALL')}>
                    {t('filter.all')}
                </button>
                <button type="button"
                        className={`task-filter__tab ${activeTab === 'ACTIVE' && 'task-filter__tab--active'}`}
                        onClick={() => handleTabChange('ACTIVE')}>
                    {t('filter.active')}
                </button>
                <button type="button"
                        className={`task-filter__tab ${activeTab === 'COMPLETED' && 'task-filter__tab--active'}`}
                        onClick={() => handleTabChange('COMPLETED')}>
                    {t('filter.completed')}
                </button>
            </div>
        </div>
    );
}

export default TaskFilter;
