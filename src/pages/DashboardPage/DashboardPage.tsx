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

    if (isLoading) return <p>Загрузка...</p>;
    if (error) return <p>Ошибка: {error}</p>;

    return (
        <div className="dashboard">
            <h2>Пользователи</h2>
            {users.map((user) => (
                <div key={user.id}>{user.name} ({user.username}) — {user.email}</div>
            ))}
        </div>
    )
}

export default DashboardPage;
