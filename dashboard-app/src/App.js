import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import { ThemeContext } from './context/ThemeContext';
import ThemeSwitcher from './components/ThemeSwitcher';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import PhotoGalleryPage from './pages/PhotoGalleryPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const { theme } = useContext(ThemeContext);

  return (
    <Router>
      <div className={`app ${theme}`}>
        <header className="header">
          <h1>Dashboard</h1>
          <ThemeSwitcher />
        </header>
        <div className="container">
          <aside className="sidebar">
            <nav>
              <ul>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/gallery">Photo Gallery</Link></li>
              </ul>
            </nav>
          </aside>
          <main className="main-content">
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <HomePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/gallery"
                element={
                  <ProtectedRoute>
                    <PhotoGalleryPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
