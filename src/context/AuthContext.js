import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { BASE_URL } from '../utils/constant';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Update localStorage when token changes
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
      setUser(null);
    }
  }, [token]);

  useEffect(() => {
    // Fetch user details when token is available
    const fetchUser = async () => {
      if (token) {
        try {
          const response = await axios.get(`${BASE_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUser(response.data); // Expecting { id, username, email, role, ... }
        } catch (err) {
          console.error('Error fetching user:', err);
          setToken(null); // Clear token on auth error
          setUser(null);
        }
      }
      setLoading(false);
    };
    fetchUser();
  }, [token]);

  return (
    <AuthContext.Provider value={{ token, setToken, user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};