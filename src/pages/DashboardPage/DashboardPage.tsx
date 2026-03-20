import { useState, useEffect } from "react";

type User = {
    id: number;
    name: string;
    username: string;
    email: string;
}

function DashboardPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchUsers = async () => {
        try {
            const response = await fetch('https://jsonplaceholder.typicode.com/users');
            const data: User[] = await response.json();

            if (!Array.isArray(data)) {
                setError('Неожиданный формат данных');
            } else {
                setUsers(data);
            }
        } catch (e) {
            setError('Не удалось загрузить пользователей');
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => { fetchUsers() }, []);

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
    )
}

export default DashboardPage;
