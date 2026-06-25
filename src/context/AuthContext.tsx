import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, UserRole } from '../types';
import { authStorage, doctorStorage, patientStorage } from '../utils/storage';

interface AuthContextValue {
  user: User | null;
  role: UserRole | null;
  profileId: string | null; // doctor.id or patient.id
  isAuthenticated: boolean;
  login: (email: string, password: string) => { success: boolean; message: string };
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => authStorage.getCurrentUser());

  const profileId = React.useMemo(() => {
    if (!user) return null;
    if (user.role === 'doctor') return doctorStorage.getByUserId(user.id)?.id ?? null;
    if (user.role === 'patient') return patientStorage.getByUserId(user.id)?.id ?? null;
    return null;
  }, [user]);

  const login = useCallback((email: string, password: string) => {
    const found = authStorage.login(email, password);
    if (!found) return { success: false, message: 'Invalid email or password.' };
    authStorage.setCurrentUser(found);
    setUser(found);
    return { success: true, message: 'Welcome back!' };
  }, []);

  const logout = useCallback(() => {
    authStorage.logout();
    setUser(null);
  }, []);

  const updateUser = useCallback((updated: User) => {
    authStorage.setCurrentUser(updated);
    setUser(updated);
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      role: user?.role ?? null,
      profileId,
      isAuthenticated: !!user,
      login,
      logout,
      updateUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
