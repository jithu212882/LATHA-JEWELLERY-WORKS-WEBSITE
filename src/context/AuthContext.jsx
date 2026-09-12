import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('latha_admin_token') || null);
  const [user, setUser] = useState(null);
  const [authenticating, setAuthenticating] = useState(true);

  const verifyToken = async (currentToken) => {
    if (!currentToken) {
      setAuthenticating(false);
      return;
    }
    try {
      const res = await fetch('/api/auth/verify', {
        headers: { Authorization: `Bearer ${currentToken}` }
      });
      if (res.ok) {
        const json = await res.json();
        setUser(json.user);
      } else {
        logout();
      }
    } catch (err) {
      console.error('Auth verification error:', err);
      logout();
    } finally {
      setAuthenticating(false);
    }
  };

  useEffect(() => {
    verifyToken(token);
  }, [token]);

  const login = async (username, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    if (!res.ok) {
      const json = await res.json();
      throw new Error(json.error || 'Login failed');
    }

    const json = await res.json();
    setToken(json.token);
    setUser({ username: json.username, role: json.role });
    localStorage.setItem('latha_admin_token', json.token);
    return json;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('latha_admin_token');
  };

  return (
    <AuthContext.Provider value={{ token, user, isAuthenticated: !!token && !!user, authenticating, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
