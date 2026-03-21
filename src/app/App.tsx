import { useState } from 'react';
import './App.css'
import UserPanel from '@/widgets/user-panel/UserPanel.tsx';
import DashboardPage from '@/pages/DashboardPage/DashboardPage.tsx';
import TasksPage from '@/pages/TaskPage/TasksPage.tsx';

type Page = 'TASKS' | 'DASHBOARD';

function App() {
    const [activePage, setActivePage] = useState<Page>('TASKS');

    return (
        <div className="App">
            <header className="App-header">
                <span>React Learning Dashboard</span>
                <nav className="App-nav">
                    <button
                        type="button"
                        className={`App-nav__tab ${activePage === 'TASKS' ? 'App-nav__tab--active' : ''}`}
                        onClick={() => setActivePage('TASKS')}
                    >
                        Задачи
                    <button
                        type="button"
                        className={`App-nav__tab ${activePage === 'DASHBOARD' ? 'App-nav__tab--active' : ''}`}
                        onClick={() => setActivePage('DASHBOARD')}
                    >
                        Пользователи
                    </button>
                    </button>
                </nav>
            </header>
            <main className="App-main">
                <aside className="App-sidebar">
                    <UserPanel />
                </aside>
                <section className="App-content">
                    {activePage === 'TASKS' && <TasksPage />}
                    {activePage === 'DASHBOARD' && <DashboardPage />}
                </section>
            </main>
        </div>
    );
}

export default App
