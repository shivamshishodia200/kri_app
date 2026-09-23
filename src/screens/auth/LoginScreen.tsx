import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types/navigation';
import { colors } from '../../theme/colors';
import { radii, spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { AppLogo } from '../../components/common/AppLogo';
import { FormField } from '../../components/common/FormField';
import { Button } from '../../components/common/Button';
import { Icon } from '../../components/common/Icon';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types/user';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('buyer');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ identifier?: string; password?: string }>({});

  const validate = () => {
    let valid = true;
    let newErrors: { identifier?: string; password?: string } = {};

    if (!identifier.trim()) {
      newErrors.identifier = 'Enter mobile number or email';
      valid = false;
    }
    if (!password) {
      newErrors.password = 'Enter your password';
      valid = false;
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    await login(identifier, role);
    setLoading(false);
  };

  const handleQuickOtpLogin = () => {
    if (!identifier.trim()) {
      setErrors({ identifier: 'Please enter mobile number to receive OTP' });
      return;
    }
    navigation.navigate('OtpVerification', {
      phoneOrEmail: identifier,
      mode: 'signup',
    });
  };

  const fillDemoCredentials = (selectedRole: UserRole) => {
    setRole(selectedRole);
    if (selectedRole === 'buyer') {
      setIdentifier('9876543210');
      setPassword('password123');
    } else {
      setIdentifier('owner@kirayedar24.com');
      setPassword('password123');
    }
    setErrors({});
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0F19" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Top Brand Hero Section */}
          <View style={styles.heroHeader}>
            {/* Ambient Back Glow */}
            <View style={styles.heroGlow} />

            <View style={styles.logoWrapper}>
              <AppLogo width={220} height={110} variant="light" />
            </View>

            <View style={styles.badgePill}>
              <Icon name="sparkles" size={13} color={colors.primary} />
              <Text style={styles.badgePillText}>India's Verified Realty Marketplace</Text>
            </View>
          </View>

          {/* Main Card Container */}
          <View style={styles.card}>
            {/* Welcome Heading */}
            <View style={styles.headingBlock}>
              <Text style={styles.welcomeTitle}>Welcome Back 👋</Text>
              <Text style={styles.welcomeSubtitle}>
                Sign in to manage properties, viewings & rental payments.
              </Text>
            </View>

            {/* Role Switcher */}
            <View style={styles.roleContainer}>
              <Text style={styles.roleHeaderLabel}>Select Account Type</Text>
              <View style={styles.roleTabs}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => setRole('buyer')}
                  style={[styles.roleTab, role === 'buyer' && styles.roleTabActive]}
                >
                  <Icon
                    name="home"
                    size={16}
                    color={role === 'buyer' ? '#1A202C' : '#64748B'}
                  />
                  <Text style={[styles.roleTabText, role === 'buyer' && styles.roleTabTextActive]}>
                    Buyer / Tenant
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => setRole('owner')}
                  style={[styles.roleTab, role === 'owner' && styles.roleTabActive]}
                >
                  <Icon
                    name="building"
                    size={16}
                    color={role === 'owner' ? '#1A202C' : '#64748B'}
                  />
                  <Text style={[styles.roleTabText, role === 'owner' && styles.roleTabTextActive]}>
                    Owner / Landlord
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Input Fields */}
            <FormField
              label="Mobile Number or Email"
              value={identifier}
              onChangeText={(txt) => {
                setIdentifier(txt);
                if (errors.identifier) setErrors({ ...errors, identifier: undefined });
              }}
              placeholder="e.g. 9876543210 or name@mail.com"
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.identifier}
              required
              leftIcon={<Icon name="mail" size={18} color={colors.textSecondary} />}
            />

            <FormField
              label="Password"
              value={password}
              onChangeText={(txt) => {
                setPassword(txt);
                if (errors.password) setErrors({ ...errors, password: undefined });
              }}
              placeholder="Enter your password"
              isPassword
              error={errors.password}
              required
              leftIcon={<Icon name="lock" size={18} color={colors.textSecondary} />}
            />

            {/* Forgot Password Row */}
            <View style={styles.forgotRow}>
              <TouchableOpacity
                onPress={() => navigation.navigate('ForgotPassword')}
                activeOpacity={0.7}
              >
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            {/* Login Action Button */}
            <Button
              title="Sign In to Kirayedar24"
              onPress={handleLogin}
              loading={loading}
              variant="primary"
              size="lg"
              fullWidth
              style={styles.loginButton}
              icon={<Icon name="arrow-right" size={18} color={colors.darkText} />}
            />

            {/* Quick Demo Fill Buttons */}
            <View style={styles.demoFillRow}>
              <Text style={styles.demoFillLabel}>Quick Demo Fill:</Text>
              <TouchableOpacity
                style={styles.demoPill}
                onPress={() => fillDemoCredentials('buyer')}
              >
                <Text style={styles.demoPillText}>Tenant</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.demoPill}
                onPress={() => fillDemoCredentials('owner')}
              >
                <Text style={styles.demoPillText}>Owner</Text>
              </TouchableOpacity>
            </View>

            {/* Divider */}
            <View style={styles.orDivider}>
              <View style={styles.dividerLine} />
              <Text style={styles.orText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* OTP Login Option */}
            <Button
              title="Sign In with SMS OTP"
              onPress={handleQuickOtpLogin}
              variant="outline"
              size="md"
              fullWidth
              style={styles.otpButton}
              icon={<Icon name="shield-check" size={18} color={colors.primaryDark} />}
            />

            {/* Signup Link */}
            <View style={styles.signupRow}>
              <Text style={styles.signupPrompt}>Don't have an account? </Text>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => navigation.navigate('Signup', { defaultRole: role })}
              >
                <Text style={styles.signupLink}>Create Account</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer Security Note */}
          <View style={styles.footer}>
            <Icon name="shield-check" size={14} color="#94A3B8" />
            <Text style={styles.footerText}>256-Bit Encrypted • Safe & RERA Compliant</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F19',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 32,
  },
  heroHeader: {
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 44 : 28,
    paddingBottom: 24,
    paddingHorizontal: 20,
    backgroundColor: '#0B0F19',
  },
  heroGlow: {
    position: 'absolute',
    top: 10,
    width: 200,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(253, 176, 34, 0.12)',
  },
  logoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(253, 176, 34, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(253, 176, 34, 0.3)',
    gap: 6,
  },
  badgePillText: {
    ...typography.badge,
    color: colors.primary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  headingBlock: {
    marginBottom: 18,
  },
  welcomeTitle: {
    ...typography.h2,
    fontSize: 22,
    color: '#0F172A',
    fontWeight: '800',
    marginBottom: 4,
  },
  welcomeSubtitle: {
    ...typography.bodyMedium,
    color: '#64748B',
    fontSize: 13,
    lineHeight: 18,
  },
  roleContainer: {
    marginBottom: 18,
  },
  roleHeaderLabel: {
    ...typography.caption,
    fontSize: 12,
    color: '#475569',
    fontWeight: '700',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  roleTabs: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 4,
  },
  roleTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingVertical: 10,
    borderRadius: 9,
  },
  roleTabActive: {
    backgroundColor: colors.primary,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  roleTabText: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: '#64748B',
    fontSize: 13,
  },
  roleTabTextActive: {
    color: '#0F172A',
    fontWeight: '800',
  },
  forgotRow: {
    alignItems: 'flex-end',
    marginBottom: 18,
    marginTop: -4,
  },
  forgotText: {
    ...typography.bodySmall,
    color: colors.primaryDark,
    fontWeight: '700',
    fontSize: 13,
  },
  loginButton: {
    marginBottom: 12,
    borderRadius: 12,
  },
  demoFillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 14,
  },
  demoFillLabel: {
    ...typography.caption,
    color: '#94A3B8',
    fontSize: 11,
  },
  demoPill: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  demoPillText: {
    ...typography.caption,
    color: '#334155',
    fontWeight: '600',
    fontSize: 11,
  },
  orDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  orText: {
    ...typography.caption,
    color: '#94A3B8',
    paddingHorizontal: 12,
    fontWeight: '600',
    fontSize: 12,
  },
  otpButton: {
    marginBottom: 18,
    borderRadius: 12,
    borderColor: '#E2E8F0',
  },
  signupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  signupPrompt: {
    ...typography.bodyMedium,
    color: '#64748B',
    fontSize: 14,
  },
  signupLink: {
    ...typography.bodyMedium,
    color: colors.primaryDark,
    fontWeight: '800',
    fontSize: 14,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingTop: 16,
    paddingBottom: 8,
  },
  footerText: {
    ...typography.caption,
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '500',
  },
});
