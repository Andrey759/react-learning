import './App.css'
import UserPanel from "../widgets/user-panel/UserPanel.tsx";
import DashboardPage from "../pages/DashboardPage/DashboardPage.tsx";

function App() {
  return (
    <div className="App">
      <header className="App-header">React Learning Dashboard</header>
      <main className="App-main">
        <aside className="App-sidebar">
          <UserPanel />
        </aside>
        <section className="App-content">
          <DashboardPage />
        </section>
      </main>
    </div>
  );
}

export default App
