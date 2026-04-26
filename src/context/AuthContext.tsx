import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'STUDENT' | 'TEACHER' | 'COORDINATOR' | 'ADMIN';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  login: (role: UserRole) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for saved user in localStorage
    const savedUser = localStorage.getItem('auth_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = (role: UserRole) => {
    const mockUser: User = {
      id: '1',
      name: `Mock ${role.charAt(0) + role.slice(1).toLowerCase()}`,
      email: `${role.toLowerCase()}@example.com`,
      role,
    };
    setUser(mockUser);
    
    try {
      localStorage.setItem('auth_user', JSON.stringify(mockUser));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
      if (e instanceof DOMException && (e.code === 22 || e.code === 1014 || e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
        // Try clearing and saving again
        try {
          localStorage.clear();
          localStorage.setItem('auth_user', JSON.stringify(mockUser));
        } catch (retryError) {
          console.error('Storage still full after clear:', retryError);
        }
      }
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
