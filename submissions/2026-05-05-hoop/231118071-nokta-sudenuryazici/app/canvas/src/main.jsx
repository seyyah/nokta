import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import GoogleAuthProvider from './auth/GoogleAuthProvider'
import './index.css'
import ConnectPage from './pages/ConnectPage.jsx'
import BudgetPage from './pages/BudgetPage.jsx'
import AnalyzePage from './pages/AnalyzePage.jsx'

createRoot(document.getElementById('root')).render(
  <GoogleAuthProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ConnectPage />} />
        <Route path="/connect" element={<ConnectPage />} />
        <Route path="/budget" element={<BudgetPage />} />
        <Route path="/analyze" element={<AnalyzePage />} />
      </Routes>
    </BrowserRouter>
  </GoogleAuthProvider>,
)
