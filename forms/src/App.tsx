import './App.css';
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Questions from './Questions';
import Results from './Results';
import Login from './components/Login';
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <Router>
          <Header />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Navigate to="/questions" replace />} />
            <Route path="/questions" element={
              <ProtectedRoute>
                <Questions />
              </ProtectedRoute>
            } />
            <Route path="/results/:userId" element={
              <ProtectedRoute>
                <Results />
              </ProtectedRoute>
            } />
          </Routes>
        </Router>
      </div>
    </AuthProvider>
  );
}

export default App;