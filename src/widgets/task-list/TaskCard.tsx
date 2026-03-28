import React from 'react';
import HighlightText from '@/shared/ui/HighlightText.tsx';
import type { UserTask } from '@/entities/task/model/types.ts';
import { logger } from '@/shared/lib/logger.ts';

type Props = {
    task: UserTask;
    highlight: string;
    onToggle: (id: number, completed: boolean) => void;
    isLoading: boolean;
};

const TaskCard = React.memo(function TaskCard({ task, highlight, onToggle, isLoading }: Props) {
    const handleToggle = () => {
        logger.info('Button click:', { action: 'toggle-task', taskId: task.id, completed: task.completed });
        onToggle(task.id, task.completed);
    };

    return (
        <div key={task.id} className="task-card" role="listitem">
            <div className="task-card__main">
                <button
                    type="button"
                    className={`task-card__status ${isLoading ? '' : task.completed ? 'task-card__status--done' : 'task-card__status--todo'}`}
                    onClick={handleToggle}
                    disabled={isLoading}
                    aria-label={task.completed ? 'Отметить как активную' : 'Отметить как выполненную'}
                >
                    {isLoading ? <span className="task-card__spinner">⟳</span> : task.completed ? '✓' : '○'}
                </button>
                <span className={`task-card__title ${task.completed ? 'task-card__title--done' : ''}`}>
                    <HighlightText text={task.title} highlight={highlight} />
                </span>
            </div>
            <div className="task-card__user">@{task.user?.username}</div>
        </div>
    );
});

export default TaskCard;
