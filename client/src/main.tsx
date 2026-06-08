import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import CreationPage from './pages/CreationPage.tsx'
import PortfolioPage from './pages/PortfolioPage.tsx'
import InspirationPage from './pages/InspirationPage.tsx'
import NavBar from './components/NavBar.tsx'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[var(--bg-primary)]">
        <NavBar />
        <Routes>
          <Route path="/" element={<CreationPage />} />
          <Route path="/portfolio" element={<PortfolioPage />} />
          <Route path="/inspiration" element={<InspirationPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
