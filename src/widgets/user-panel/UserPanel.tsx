import { useState } from 'react';

const MOCK_USERS = [
    { id: 1, name: 'John' },
    { id: 2, name: 'Doe' },
    { id: 3, name: 'Alice' },
];

function UserPanel() {
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const selectedUserName =
        selectedId !== null
            ? MOCK_USERS.find(u => u.id === selectedId)?.name
            : null;

    return (
        <div className="user-panel">
            <h2 className="user-panel__title">Вы</h2>

            <div className="user-panel__list" role="list">
                {MOCK_USERS.map((user) => {
                    const isSelected = selectedId === user.id;

                    return (
                        <button
                            key={user.id}
                            type="button"
                            className={`user-panel__user ${isSelected ? 'user-panel__user--selected' : ''}`}
                            onClick={() => setSelectedId(user.id)}
                            aria-pressed={isSelected}
                        >
                            {user.name}
                        </button>
                    );
                })}
            </div>

            <div className="user-panel__footer">
                {selectedUserName !== null ? (
                    <p className="user-panel__selected">
                        <span className="user-panel__selected-label">Выбран:</span> {selectedUserName}
                    </p>
                ) : (
                    <p className="user-panel__muted">Выберите пользователя</p>
                )}
            </div>
        </div>
    )
}

export default UserPanel;
