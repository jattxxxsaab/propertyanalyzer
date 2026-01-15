import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Results from './pages/Results'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <header className="app-header">
          <div className="container">
            <h1 className="logo">
              <a href="/">Property Analyzer</a>
            </h1>
            <p className="tagline">Professional Real Estate Analysis</p>
          </div>
        </header>

        <main className="app-main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/property" element={<Results />} />
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
