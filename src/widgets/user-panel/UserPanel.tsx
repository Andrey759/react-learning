// src/widgets/user-panel/UserPanel.tsx

import { useState } from 'react';
import { useAuth } from '@/app/providers/AuthProvider.tsx';

function UserPanel() {
    const { state, login, logout } = useAuth();

    const [email, setEmail] = useState('eve.holt@reqres.in');
    const [password, setPassword] = useState('cityslicka');

    const handleSubmit = () => {
        if (email && password) {
            login(email, password);
        }
    };

    if (state.status === 'authenticated') {
        return (
            <div className="user-panel">
                <div className="user-panel__auth-info">
                    <div className="user-panel__auth-label">Вы вошли как</div>
                    <div className="user-panel__auth-email">{state.email}</div>
                </div>
                <div className="user-panel__footer">
                    <button type="button" className="user-panel__logout-btn" onClick={logout}>
                        Выйти
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="user-panel">
            <h2 className="user-panel__title">Войти</h2>

            <div className="user-panel__form">
                <input
                    className="user-panel__input"
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    disabled={state.status === 'loading'}
                />
                <input
                    className="user-panel__input"
                    type="password"
                    placeholder="Пароль"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    disabled={state.status === 'loading'}
                    onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                />

                {state.status === 'error' && (
                    <div className="user-panel__error">{state.message}</div>
                )}

                <button
                    type="button"
                    className="user-panel__submit-btn"
                    onClick={handleSubmit}
                    disabled={state.status === 'loading'}
                >
                    {state.status === 'loading' ? 'Вход...' : 'Войти'}
                </button>

                <div className="user-panel__hint">
                    Тестовый аккаунт: eve.holt@reqres.in / cityslicka
                </div>
            </div>
        </div>
    );
}

export default UserPanel;
