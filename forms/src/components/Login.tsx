import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!username.trim() || !password.trim()) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    try {
      if (isRegistering) {
        await register(username.trim(), password);
      } else {
        await login(username.trim(), password);
      }
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setError('');
    setUsername('');
    setPassword('');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>{isRegistering ? 'Create Account' : 'Login'}</h1>
          <p>
            {isRegistering 
              ? 'Create a new account to access the questionnaire' 
              : 'Login to access your questionnaire'
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username" className="form-label">
              Username
            </label>
            <input
              type="text"
              id="username"
              className="form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              disabled={isLoading}
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              disabled={isLoading}
              autoComplete={isRegistering ? "new-password" : "current-password"}
            />
            {isRegistering && (
              <small className="form-hint">
                Password must be at least 6 characters long
              </small>
            )}
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="login-button"
            disabled={isLoading}
          >
            {isLoading 
              ? (isRegistering ? 'Creating Account...' : 'Logging in...') 
              : (isRegistering ? 'Create Account' : 'Login')
            }
          </button>
        </form>

        <div className="login-footer">
          <p>
            {isRegistering ? 'Already have an account?' : "Don't have an account?"}
            {' '}
            <button 
              type="button" 
              className="toggle-button"
              onClick={toggleMode}
              disabled={isLoading}
            >
              {isRegistering ? 'Login here' : 'Create one here'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
