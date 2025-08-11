import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    return null;
  }

  return (
    <header className="app-header">
      <div className="header-content">
        <div className="header-left">
          <h2>Waterlily Survey</h2>
        </div>
        <div className="header-right">
          <span className="user-info">Welcome, {user.username}</span>
          <button 
            onClick={handleLogout}
            className="logout-button"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
