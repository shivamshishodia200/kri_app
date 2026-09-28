import { User, UserRole, UserLegalConsent } from '../types/user';
import { LEGAL_VERSIONS } from '../data/legalPolicies';

export interface SignupConsentPayload {
  termsAccepted: boolean;
  termsVersion: string;
  privacyAccepted: boolean;
  privacyVersion: string;
  marketingOptIn?: boolean;
}

export interface InitiateSignupRequest {
  name: string;
  email: string;
  phone: string;
  password?: string;
  role: UserRole;
  consent: SignupConsentPayload;
}

export interface PendingRegistration {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  otpCode: string;
  otpExpiresAt: number;
  consent: UserLegalConsent;
  createdAt: number;
}

export interface BackendAuthResponse {
  success: boolean;
  message?: string;
  error?: string;
  user?: User;
  token?: string;
  requiresPolicyReconsent?: boolean;
}

class AuthBackendService {
  // In-memory simulated database table for registered users
  private users: Map<string, User> = new Map();

  // In-memory pending registrations table (stores pending accounts pre-OTP)
  private pendingRegistrations: Map<string, PendingRegistration> = new Map();

  constructor() {
    // Seed standard demo user
    const defaultUser: User = {
      id: 'usr-default-101',
      name: 'Rajesh Sharma',
      email: 'rajesh.sharma@example.com',
      phone: '+91 98765 01234',
      avatarUrl:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      role: 'buyer',
      isVerified: true,
      city: 'Bangalore',
      referralCode: 'KIRAYE24RAJ',
      legalConsent: {
        termsAccepted: true,
        termsVersion: LEGAL_VERSIONS.termsVersion,
        privacyAccepted: true,
        privacyVersion: LEGAL_VERSIONS.privacyVersion,
        acceptedAt: '2026-09-01T10:00:00.000Z',
        marketingOptIn: true,
      },
      stats: {
        propertiesListed: 3,
        inquiriesReceived: 24,
        savedProperties: 4,
        activeBookings: 1,
      },
    };
    this.users.set(defaultUser.phone, defaultUser);
    this.users.set(defaultUser.email, defaultUser);
  }

  /**
  * Simulated Stage 1: validate consent in this in-memory client service before generating OTP.
   */
  async initiateSignup(req: InitiateSignupRequest): Promise<BackendAuthResponse> {
    await new Promise((resolve) => setTimeout(resolve, 200));

    // 1. Basic validation
    if (!req.name?.trim() || !req.email?.trim() || !req.phone?.trim()) {
      return {
        success: false,
        error: 'Missing required signup fields (name, email, phone).',
      };
    }

    // 2. Strict Legal Consent Validation on Backend
    if (!req.consent || req.consent.termsAccepted !== true || req.consent.privacyAccepted !== true) {
      return {
        success: false,
        error:
          'Consent validation failed: You must explicitly accept the Terms & Conditions and Privacy Policy.',
      };
    }

    // 3. Policy version validation against server active versions
    const activeVersions = LEGAL_VERSIONS;
    if (
      req.consent.termsVersion !== activeVersions.termsVersion ||
      req.consent.privacyVersion !== activeVersions.privacyVersion
    ) {
      return {
        success: false,
        error: 'Policy version mismatch. Please review the updated policy terms.',
      };
    }

    // Simulation only: a production backend must generate and persist its own timestamp.
    const serverTimestamp = new Date().toISOString();

    const verifiedConsent: UserLegalConsent = {
      termsAccepted: true,
      termsVersion: activeVersions.termsVersion,
      privacyAccepted: true,
      privacyVersion: activeVersions.privacyVersion,
      acceptedAt: serverTimestamp,
      marketingOptIn: Boolean(req.consent.marketingOptIn),
    };

    // 5. Store pending registration session with 10-minute expiry
    const cleanPhone = req.phone.trim();
    const pendingSession: PendingRegistration = {
      id: `pending-${Date.now()}`,
      name: req.name.trim(),
      email: req.email.trim().toLowerCase(),
      phone: cleanPhone,
      role: req.role,
      otpCode: '248900', // Demo OTP code, any 6-digit accepted in sandbox
      otpExpiresAt: Date.now() + 10 * 60 * 1000,
      consent: verifiedConsent,
      createdAt: Date.now(),
    };

    this.pendingRegistrations.set(cleanPhone, pendingSession);
    this.pendingRegistrations.set(pendingSession.email, pendingSession);

    return {
      success: true,
      message: `OTP verification code sent to ${cleanPhone}`,
    };
  }

  /**
  * Simulated Stage 2: activate the in-memory account only after successful OTP verification.
   */
  async verifySignupOtp(phoneOrEmail: string, otp: string): Promise<BackendAuthResponse> {
    await new Promise((resolve) => setTimeout(resolve, 200));

    const cleanKey = phoneOrEmail.trim().toLowerCase();
    const pending = this.pendingRegistrations.get(cleanKey);

    if (!pending) {
      // If user is doing demo quick verify or direct phone verification
      return this.fallbackVerifyDemo(phoneOrEmail);
    }

    // Check expiration
    if (Date.now() > pending.otpExpiresAt) {
      return {
        success: false,
        error: 'OTP code has expired. Please tap Resend Code to receive a new one.',
      };
    }

    // Check OTP digits (in demo mode we accept exact or 6-digit codes)
    if (otp.length < 6) {
      return {
        success: false,
        error: 'Please enter a valid 6-digit verification code.',
      };
    }

    // Check if active policy changed while pending
    const currentVersions = LEGAL_VERSIONS;
    if (
      pending.consent.termsVersion !== currentVersions.termsVersion ||
      pending.consent.privacyVersion !== currentVersions.privacyVersion
    ) {
      return {
        success: false,
        requiresPolicyReconsent: true,
        error: 'Policies were updated during registration. Please re-confirm acceptance.',
      };
    }

    // Create and activate verified user
    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: pending.name,
      email: pending.email,
      phone: pending.phone,
      role: pending.role,
      isVerified: true,
      city: 'Bangalore',
      referralCode: `KIRAYE${Math.floor(1000 + Math.random() * 9000)}`,
      legalConsent: pending.consent,
      stats: {
        propertiesListed: pending.role === 'owner' ? 0 : undefined,
        inquiriesReceived: 0,
        savedProperties: 0,
        activeBookings: 0,
      },
    };

    // Save to active users table
    this.users.set(newUser.phone, newUser);
    this.users.set(newUser.email, newUser);

    // Clean up pending registration
    this.pendingRegistrations.delete(cleanKey);
    this.pendingRegistrations.delete(pending.phone);
    this.pendingRegistrations.delete(pending.email);

    return {
      success: true,
      user: newUser,
      token: `kz-jwt-${Date.now()}`,
      message: 'Account verified and activated successfully.',
    };
  }

  /**
   * Resend OTP for pending registration
   * Preserves already accepted legal consent versions.
   */
  async resendOtp(phoneOrEmail: string): Promise<BackendAuthResponse> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const cleanKey = phoneOrEmail.trim().toLowerCase();
    const pending = this.pendingRegistrations.get(cleanKey);

    if (pending) {
      pending.otpExpiresAt = Date.now() + 10 * 60 * 1000;
      return {
        success: true,
        message: `New 6-digit OTP code sent to ${phoneOrEmail}`,
      };
    }

    return {
      success: true,
      message: `OTP sent to ${phoneOrEmail}`,
    };
  }

  /**
   * Standard Login for existing users
   * Preserves existing authentication and does not force re-signup.
   */
  async login(phoneOrEmail: string, role: UserRole = 'buyer'): Promise<BackendAuthResponse> {
    await new Promise((resolve) => setTimeout(resolve, 200));

    const cleanKey = phoneOrEmail.trim().toLowerCase();
    let existingUser = this.users.get(cleanKey);

    if (!existingUser) {
      existingUser = {
        id: `usr-${Date.now()}`,
        name: cleanKey.includes('@') ? cleanKey.split('@')[0] : 'Kirayedar User',
        email: cleanKey.includes('@') ? cleanKey : 'user@kirayedar24.com',
        phone: !cleanKey.includes('@') ? cleanKey : '+91 98765 01234',
        role: role,
        isVerified: true,
        city: 'Bangalore',
        referralCode: 'KIRAYE24USER',
        legalConsent: {
          termsAccepted: true,
          termsVersion: LEGAL_VERSIONS.termsVersion,
          privacyAccepted: true,
          privacyVersion: LEGAL_VERSIONS.privacyVersion,
          acceptedAt: new Date().toISOString(),
          marketingOptIn: false,
        },
        stats: {
          propertiesListed: role === 'owner' ? 2 : undefined,
          inquiriesReceived: 12,
          savedProperties: 3,
          activeBookings: 1,
        },
      };
      this.users.set(cleanKey, existingUser);
    }

    // Ensure role matches login choice
    existingUser = { ...existingUser, role };
    this.users.set(cleanKey, existingUser);

    return {
      success: true,
      user: existingUser,
      token: `kz-jwt-${Date.now()}`,
    };
  }

  /**
   * Record updated policy acceptance for existing user
   */
  async acceptPolicyUpdate(userId: string, marketingOptIn = false): Promise<BackendAuthResponse> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const serverTimestamp = new Date().toISOString();

    for (const [key, user] of this.users.entries()) {
      if (user.id === userId) {
        user.legalConsent = {
          termsAccepted: true,
          termsVersion: LEGAL_VERSIONS.termsVersion,
          privacyAccepted: true,
          privacyVersion: LEGAL_VERSIONS.privacyVersion,
          acceptedAt: serverTimestamp,
          marketingOptIn,
        };
        this.users.set(key, user);
      }
    }

    return {
      success: true,
      message: 'Policy acceptance updated.',
    };
  }

  /**
   * Helper for demo sandbox OTP logins
   */
  private fallbackVerifyDemo(phoneOrEmail: string): BackendAuthResponse {
    const isEmail = phoneOrEmail.includes('@');
    const demoUser: User = {
      id: `usr-${Date.now()}`,
      name: isEmail ? phoneOrEmail.split('@')[0] : 'Verified Resident',
      email: isEmail ? phoneOrEmail : 'resident@kirayedar24.com',
      phone: !isEmail ? phoneOrEmail : '+91 98765 43210',
      role: 'buyer',
      isVerified: true,
      city: 'Bangalore',
      referralCode: 'KIRAYE24RES',
      legalConsent: {
        termsAccepted: true,
        termsVersion: LEGAL_VERSIONS.termsVersion,
        privacyAccepted: true,
        privacyVersion: LEGAL_VERSIONS.privacyVersion,
        acceptedAt: new Date().toISOString(),
        marketingOptIn: false,
      },
      stats: {
        inquiriesReceived: 5,
        savedProperties: 2,
        activeBookings: 0,
      },
    };
    return {
      success: true,
      user: demoUser,
      token: `kz-jwt-${Date.now()}`,
    };
  }
}

export const authBackendService = new AuthBackendService();
