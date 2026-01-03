import { useState, useEffect } from 'react';
import { auth } from './lib/auth';
import { setUnauthorizedHandler } from './lib/api';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated on mount
    setIsAuthenticated(auth.isAuthenticated());
    setLoading(false);

    // Set up unauthorized handler for 401 errors
    setUnauthorizedHandler(() => {
      setIsAuthenticated(false);
    });
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
    setShowSignup(false);
  };

  const handleSignup = () => {
    setIsAuthenticated(true);
    setShowSignup(false);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setShowSignup(false);
  };

  const handleSwitchToSignup = () => {
    setShowSignup(true);
  };

  const handleSwitchToLogin = () => {
    setShowSignup(false);
  };

  if (loading) {
    return <div className="app-loading">Loading...</div>;
  }

  return (
    <div className="app">
      {isAuthenticated ? (
        <Dashboard onLogout={handleLogout} />
      ) : showSignup ? (
        <Signup onSignup={handleSignup} onSwitchToLogin={handleSwitchToLogin} />
      ) : (
        <Login onLogin={handleLogin} onSwitchToSignup={handleSwitchToSignup} />
      )}
    </div>
  );
}

export default App;
