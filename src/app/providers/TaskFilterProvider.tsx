import { createContext, useContext, useState } from 'react';
import type { FilterTab } from '@/entities/task/model/types.ts';

type TaskFilterContextValue = {
    filterText: string;
    setFilterText: (value: string) => void;
    activeTab: FilterTab;
    setActiveTab: (tab: FilterTab) => void;
};

const TaskFilterContext = createContext<TaskFilterContextValue | null>(null);

export function TaskFilterProvider({ children }: { children: React.ReactNode }) {
    const [filterText, setFilterText] = useState<string>('');
    const [activeTab, setActiveTab] = useState<FilterTab>('ALL');

    return (
        <TaskFilterContext.Provider value={{ filterText, setFilterText, activeTab, setActiveTab }}>
            {children}
        </TaskFilterContext.Provider>
    );
}

export function useTaskFilter(): TaskFilterContextValue {
    const ctx = useContext(TaskFilterContext);
    if (!ctx) throw new Error('useTaskFilter must be used within TaskFilterProvider');
    return ctx;
}
