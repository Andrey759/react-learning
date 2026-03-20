import { useState } from 'react';

const MOCK_USERS = [
    { id: 1, name: 'John' },
    { id: 2, name: 'Doe' },
    { id: 3, name: 'Alice' },
];

function UserPanel() {
    const [selectedId, setSelectedId] = useState<number | null>(null);

    return (
        <div className="user-panel">
            <h2>Пользователи</h2>
            {MOCK_USERS.map((user) => (
                <div
                    key={user.id}
                    onClick={() => setSelectedId(user.id)}
                    style={{
                        padding: '8px',
                        cursor: 'pointer',
                        background: selectedId === user.id ? '#cce5ff' : 'transparent',
                    }}
                >
                    {user.name}
                </div>
            ))}
            {selectedId !== null && (
                <p>Выбран: {MOCK_USERS.find(u => u.id === selectedId)?.name}</p>
            )}
        </div>
    )
}

export default UserPanel;
