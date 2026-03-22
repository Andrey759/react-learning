import { useState } from 'react';
import './App.css'
import UserPanel from '@/widgets/user-panel/UserPanel.tsx';
import TasksPage from '@/pages/TaskPage/TasksPage.tsx';
import UserPage from "@/pages/UserPage/UserPage.tsx";

type Page = 'TASKS' | 'USERS';

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
                    </button>
                    <button
                        type="button"
                        className={`App-nav__tab ${activePage === 'USERS' ? 'App-nav__tab--active' : ''}`}
                        onClick={() => setActivePage('USERS')}
                    >
                        Пользователи
                    </button>
                </nav>
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
