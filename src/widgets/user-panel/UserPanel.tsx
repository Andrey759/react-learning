import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/app/providers/AuthProvider.tsx';
import { logger } from '@/shared/lib/logger.ts';

function UserPanel() {
    const { state, login, logout } = useAuth();
    const { t } = useTranslation('common');

    const [email, setEmail] = useState('eve.holt@reqres.in');
    const [password, setPassword] = useState('cityslicka');

    const handleSubmit = () => {
        if (email && password) {
            logger.info('Form submit:', { action: 'login', email });
            login(email, password);
        }
    };

    const handleLogout = () => {
        logger.info('Button click:', { action: 'logout' });
        logout();
    };

    if (state.status === 'authenticated') {
        return (
            <div className="user-panel">
                <div className="user-panel__auth-info">
                    <div className="user-panel__auth-label">{t('auth.loggedInAs')}</div>
                    <div className="user-panel__auth-email">{state.email}</div>
                </div>
                <div className="user-panel__footer">
                    <button type="button" className="user-panel__logout-btn" onClick={handleLogout}>
                        {t('auth.logout')}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="user-panel">
            <h2 className="user-panel__title">{t('auth.login')}</h2>

            <div className="user-panel__form">
                <input
                    className="user-panel__input"
                    type="email"
                    placeholder={t('auth.emailPlaceholder')}
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    disabled={state.status === 'loading'}
                />
                <input
                    className="user-panel__input"
                    type="password"
                    placeholder={t('auth.passwordPlaceholder')}
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
                    {state.status === 'loading' ? t('auth.loggingIn') : t('auth.login')}
                </button>

                <div className="user-panel__hint">
                    {t('auth.testAccount')}
                </div>
            </div>
        </div>
    );
}

export default UserPanel;
