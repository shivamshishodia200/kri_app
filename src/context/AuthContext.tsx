import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, UserRole } from '../types/user';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  role: UserRole;
  setRole: (role: UserRole) => void;
  toggleRole: () => void;
  login: (phoneOrEmail: string, role?: UserRole) => Promise<boolean>;
  signup: (name: string, email: string, phone: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
}

const DEFAULT_USER: User = {
  id: 'usr-current-user',
  name: 'Rajesh Sharma',
  email: 'rajesh.sharma@example.com',
  phone: '+91 98765 01234',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  role: 'buyer',
  isVerified: true,
  city: 'Bangalore',
  referralCode: 'KIRAYE24RAJ',
  stats: {
    propertiesListed: 3,
    inquiriesReceived: 24,
    savedProperties: 4,
    activeBookings: 1,
  },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [role, setRoleState] = useState<UserRole>('buyer');

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    if (user) {
      setUser({ ...user, role: newRole });
    }
  };

  const toggleRole = () => {
    const nextRole: UserRole = role === 'buyer' ? 'owner' : 'buyer';
    setRole(nextRole);
  };

  const login = async (phoneOrEmail: string, userRole: UserRole = 'buyer'): Promise<boolean> => {
    // Simulated auth flow
    const loggedInUser: User = {
      ...DEFAULT_USER,
      email: phoneOrEmail.includes('@') ? phoneOrEmail : DEFAULT_USER.email,
      phone: !phoneOrEmail.includes('@') ? phoneOrEmail : DEFAULT_USER.phone,
      role: userRole,
    };
    setUser(loggedInUser);
    setRoleState(userRole);
    setIsAuthenticated(true);
    return true;
  };

  const signup = async (name: string, email: string, phone: string, userRole: UserRole): Promise<boolean> => {
    const newUser: User = {
      id: `usr-${Date.now()}`,
      name,
      email,
      phone,
      role: userRole,
      isVerified: false,
      city: 'Bangalore',
      referralCode: `KIRAYE${Math.floor(1000 + Math.random() * 9000)}`,
      stats: {
        propertiesListed: userRole === 'owner' ? 0 : undefined,
        inquiriesReceived: 0,
        savedProperties: 0,
        activeBookings: 0,
      },
    };
    setUser(newUser);
    setRoleState(userRole);
    setIsAuthenticated(true);
    return true;
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateProfile = (updates: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updates });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        role,
        setRole,
        toggleRole,
        login,
        signup,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
