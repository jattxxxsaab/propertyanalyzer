import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import Results from './pages/Results'
import RepairOrder from './pages/RepairOrder'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <header className="app-header">
          <div className="container">
            <div className="header-content">
              <div className="header-text">
                <h1 className="logo">
                  <Link to="/">Property Analyzer</Link>
                </h1>
                <p className="tagline">Professional Real Estate Analysis</p>
              </div>
              <nav className="header-nav">
                <Link to="/" className="nav-link">Property Search</Link>
                <Link to="/repair-orders" className="nav-link">Repair Orders</Link>
              </nav>
            </div>
          </div>
        </header>

        <main className="app-main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/property" element={<Results />} />
            <Route path="/repair-orders" element={<RepairOrder />} />
          </Routes>
        </main>

        <footer className="app-footer">
          <div className="container">
            <p>&copy; {new Date().getFullYear()} Property Analyzer. For professional use by realtors.</p>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  )
}

export default App
