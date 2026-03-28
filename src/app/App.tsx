import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './App.css'
import UserPanel from '@/widgets/user-panel/UserPanel.tsx';
import TasksPage from '@/pages/TaskPage/TasksPage.tsx';
import UserPage from '@/pages/UserPage/UserPage.tsx';
import { ThemeToggle } from '@/shared/ui/ThemeToggle.tsx';
import { LanguageSwitcher } from '@/shared/ui/LanguageSwitcher.tsx';
import { logger } from '@/shared/lib/logger.ts';

type Page = 'TASKS' | 'USERS';

function App() {
    const [activePage, setActivePage] = useState<Page>('TASKS');
    const { t } = useTranslation('common');

    const navigateTo = (page: Page) => {
        logger.info('Navigation:', { page });
        setActivePage(page);
    };

    return (
        <div className="App">
            <header className="App-header">
                <span>{t('appTitle')}</span>
                <nav className="App-nav">
                    <button
                        type="button"
                        className={`App-nav__tab ${activePage === 'TASKS' ? 'App-nav__tab--active' : ''}`}
                        onClick={() => navigateTo('TASKS')}
                    >
                        {t('nav.tasks')}
                    </button>
                    <button
                        type="button"
                        className={`App-nav__tab ${activePage === 'USERS' ? 'App-nav__tab--active' : ''}`}
                        onClick={() => navigateTo('USERS')}
                    >
                        {t('nav.users')}
                    </button>
                </nav>
                <div className="header-controls">
                    <LanguageSwitcher />
                    <ThemeToggle />
                </div>
            </header>
            <main className="App-main">
                <aside className="App-sidebar">
                    <UserPanel />
                </aside>
                <section className="App-content">
                    {activePage === 'TASKS' && <TasksPage />}
                    {activePage === 'USERS' && <UserPage />}
                </section>
            </main>
        </div>
    );
}

export default App
