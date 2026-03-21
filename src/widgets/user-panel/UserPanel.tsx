import type { User } from '../../entities/user/model/types.ts';
import { useAuth } from '../../features/auth/useAuth.ts'

const MOCK_USERS : User[] = [
    { id: 1, name: 'John' },
    { id: 2, name: 'Doe' },
    { id: 3, name: 'Alice' },
];

function UserPanel() {
    const { currentUser, isAuthenticated, login, logout } = useAuth();

    return (
        <div className="user-panel">
            <h2 className="user-panel__title">{isAuthenticated ? currentUser?.name : 'Выберите пользователя'}</h2>

            {!isAuthenticated && (
                <div className="user-panel__list" role="list">
                    {MOCK_USERS.map((user) => {
                        return (
                            <button
                                key={user.id}
                                type="button"
                                className={"user-panel__user"}
                                onClick={() => login(user)}
                            >
                                {user.name}
                            </button>
                        )}
                    )}
                </div>
            )}

            {isAuthenticated && (
                <div className="user-panel__footer">
                    <button type="button" onClick={logout}>
                        Выйти
                    </button>
                </div>
            )}
        </div>
    );
}

export default UserPanel;
