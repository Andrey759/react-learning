import './App.css'
import UserPanel from "../widgets/user-panel/UserPanel.tsx";
import DashboardPage from "../pages/DashboardPage/DashboardPage.tsx";

function App() {
  return (
    <div>
      <header className="App-header">Моё приложение</header>
        <main className="App-main">
            <UserPanel />
            <DashboardPage />
        </main>
    </div>
  )
}

export default App
