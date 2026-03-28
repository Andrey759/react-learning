import '@/i18n';
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from './providers/AuthProvider.tsx';
import App from './App.tsx'
import './index.css'
import {TaskFilterProvider} from '@/app/providers/TaskFilterProvider.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <AuthProvider>
          <TaskFilterProvider>
            <App />
          </TaskFilterProvider>
      </AuthProvider>
  </StrictMode>
)
