import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('nb_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [creatorProfile, setCreatorProfile] = useState(() => {
    try {
      const savedProfile = localStorage.getItem('nb_creator_profile');
      return savedProfile ? JSON.parse(savedProfile) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.login(email, password);
      if (res.token) {
        localStorage.setItem('nb_token', res.token);
      }
      if (res.user) {
        setUser(res.user);
        localStorage.setItem('nb_user', JSON.stringify(res.user));
      }
      if (res.creatorProfile) {
        setCreatorProfile(res.creatorProfile);
        localStorage.setItem('nb_creator_profile', JSON.stringify(res.creatorProfile));
      }
      return { success: true, user: res.user };
    } catch (error) {
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const res = await api.register(userData);
      if (res.token) {
        localStorage.setItem('nb_token', res.token);
      }
      if (res.user) {
        setUser(res.user);
        localStorage.setItem('nb_user', JSON.stringify(res.user));
      }
      if (res.creatorProfile) {
        setCreatorProfile(res.creatorProfile);
        localStorage.setItem('nb_creator_profile', JSON.stringify(res.creatorProfile));
      }
      return { success: true, user: res.user };
    } catch (error) {
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('nb_token');
    localStorage.removeItem('nb_user');
    localStorage.removeItem('nb_creator_profile');
    setUser(null);
    setCreatorProfile(null);
  };

  const loginAsDemo = async (role = 'creator') => {
    if (role === 'admin') {
      return await login('admin@newbi.live', 'admin123');
    } else if (role === 'brand') {
      return await login('brand@newbi.live', 'brand123');
    } else {
      return await login('creator@newbi.live', 'creator123');
    }
  };

  const updateProfileData = (updatedUser, updatedProfile) => {
    if (updatedUser) {
      setUser(updatedUser);
      localStorage.setItem('nb_user', JSON.stringify(updatedUser));
    }
    if (updatedProfile) {
      setCreatorProfile(updatedProfile);
      localStorage.setItem('nb_creator_profile', JSON.stringify(updatedProfile));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        creatorProfile,
        loading,
        login,
        register,
        logout,
        loginAsDemo,
        updateProfileData,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isCreator: user?.role === 'creator',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
