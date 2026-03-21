import { useState, useEffect } from 'react';
import type { User } from '@/entities/user/model/types.ts';
import { fetchUsers } from '@/entities/user/api/fetchUsers.ts';
import { AppError } from '@/shared/errors/AppError.ts';
import { ERROR_MESSAGES } from '@/shared/errors/errorMessages.ts';

function DashboardPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchUsers()
            .then(setUsers)
            .catch(e => setError(e instanceof AppError ? e.message : ERROR_MESSAGES.NETWORK_ERROR))
            .finally(() => setIsLoading(false));
    }, []);

    if (isLoading) {
        return (
            <div className="dashboard">
                <h2 className="dashboard__title">Пользователи</h2>
                <div className="dashboard__status">Загрузка...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard">
                <h2 className="dashboard__title">Пользователи</h2>
                <div className="dashboard__status dashboard__status--error">Ошибка: {error}</div>
            </div>
        );
    }

    return (
        <div className="dashboard">
            <div className="dashboard__header">
                <h2 className="dashboard__title">Пользователи</h2>
                <div className="dashboard__meta">{users.length} элементов</div>
            </div>

            <div className="dashboard__list" role="list">
                {users.map((user) => (
                    <div key={user.id} className="dashboard__userCard" role="listitem">
                        <div className="dashboard__userMain">
                            <div className="dashboard__userName">{user.name}</div>
                            <div className="dashboard__userUsername">@{user.username}</div>
                        </div>
                        <div className="dashboard__userEmail">{user.email}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default DashboardPage;
