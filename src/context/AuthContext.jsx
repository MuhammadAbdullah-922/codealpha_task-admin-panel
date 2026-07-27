import { createContext, useContext, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem('bzack_admin_user') || 'null')
  );
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.post('/login', { email, password });
      const { user, token } = res.data;

      if (user.role !== 'admin') {
        setLoading(false);
        return { success: false, message: 'Yeh account admin nahi hai. Sirf admin login kar sakte hain.' };
      }

      localStorage.setItem('bzack_admin_token', token);
      localStorage.setItem('bzack_admin_user', JSON.stringify(user));
      setUser(user);
      setLoading(false);
      return { success: true };
    } catch (err) {
      setLoading(false);
      return {
        success: false,
        message: err.response?.data?.message || 'Login fail ho gaya. Email/password check karo.',
      };
    }
  };

  const logout = async () => {
    try {
      await api.post('/logout');
    } catch (e) {
      // ignore — clearing local state anyway
    }
    localStorage.removeItem('bzack_admin_token');
    localStorage.removeItem('bzack_admin_user');
    setUser(null);
  };

  // Wraps setUser so any update (e.g. from Settings page after saving
  // profile/avatar) also stays in sync with localStorage.
  const updateUser = (updater) => {
    setUser((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      localStorage.setItem('bzack_admin_user', JSON.stringify(next));
      return next;
    });
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, loading, isAuthenticated: !!user, setUser: updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);