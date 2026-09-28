import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, UserRole } from '../types/user';
import {
  authBackendService,
  InitiateSignupRequest,
  BackendAuthResponse,
} from '../services/authBackendService';
import { LEGAL_VERSIONS } from '../data/legalPolicies';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  role: UserRole;
  setRole: (role: UserRole) => void;
  toggleRole: () => void;
  login: (phoneOrEmail: string, role?: UserRole) => Promise<boolean>;
  initiateSignup: (req: InitiateSignupRequest) => Promise<BackendAuthResponse>;
  verifySignupOtp: (phoneOrEmail: string, otp: string) => Promise<BackendAuthResponse>;
  resendOtp: (phoneOrEmail: string) => Promise<BackendAuthResponse>;
  signup: (name: string, email: string, phone: string, role: UserRole) => Promise<boolean>;
  acceptPolicyUpdate: (userId: string, marketingOptIn?: boolean) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
}

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
    const res = await authBackendService.login(phoneOrEmail, userRole);
    if (res.success && res.user) {
      setUser(res.user);
      setRoleState(res.user.role || userRole);
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const initiateSignup = async (req: InitiateSignupRequest): Promise<BackendAuthResponse> => {
    return await authBackendService.initiateSignup(req);
  };

  const verifySignupOtp = async (phoneOrEmail: string, otp: string): Promise<BackendAuthResponse> => {
    const res = await authBackendService.verifySignupOtp(phoneOrEmail, otp);
    if (res.success && res.user) {
      setUser(res.user);
      setRoleState(res.user.role);
      setIsAuthenticated(true);
    }
    return res;
  };

  const resendOtp = async (phoneOrEmail: string): Promise<BackendAuthResponse> => {
    return await authBackendService.resendOtp(phoneOrEmail);
  };

  const signup = async (
    name: string,
    email: string,
    phone: string,
    userRole: UserRole,
  ): Promise<boolean> => {
    const res = await initiateSignup({
      name,
      email,
      phone,
      role: userRole,
      consent: {
        termsAccepted: true,
        termsVersion: LEGAL_VERSIONS.termsVersion,
        privacyAccepted: true,
        privacyVersion: LEGAL_VERSIONS.privacyVersion,
        marketingOptIn: false,
      },
    });
    return res.success;
  };

  const acceptPolicyUpdate = async (userId: string, marketingOptIn = false): Promise<boolean> => {
    const res = await authBackendService.acceptPolicyUpdate(userId, marketingOptIn);
    if (res.success && user) {
      setUser({
        ...user,
        legalConsent: {
          termsAccepted: true,
          termsVersion: LEGAL_VERSIONS.termsVersion,
          privacyAccepted: true,
          privacyVersion: LEGAL_VERSIONS.privacyVersion,
          acceptedAt: new Date().toISOString(),
          marketingOptIn,
        },
      });
      return true;
    }
    return false;
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
        initiateSignup,
        verifySignupOtp,
        resendOtp,
        signup,
        acceptPolicyUpdate,
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

