import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
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

type Props = NativeStackScreenProps<AuthStackParamList, 'Signup'>;

export const SignupScreen: React.FC<Props> = ({ route, navigation }) => {
  const { signup } = useAuth();
  const defaultRole = route.params?.defaultRole || 'buyer';

  const [role, setRole] = useState<UserRole>(defaultRole);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [agreedTerms, setAgreedTerms] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    let valid = true;
    let newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Full name is required';
      valid = false;
    }
    if (!email.trim() || !email.includes('@')) {
      newErrors.email = 'Valid email address is required';
      valid = false;
    }
    if (!phone.trim() || phone.length < 10) {
      newErrors.phone = '10-digit mobile number is required';
      valid = false;
    }
    if (!password || password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      valid = false;
    }
    if (!agreedTerms) {
      Alert.alert('Terms & Conditions', 'Please accept the Terms & Conditions to create an account.');
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSignup = async () => {
    if (!validate()) return;
    navigation.navigate('OtpVerification', {
      phoneOrEmail: phone,
      mode: 'signup',
    });
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
            <View style={styles.heroGlow} />

            <View style={styles.logoWrapper}>
              <AppLogo width={200} height={100} variant="light" />
            </View>

            <View style={styles.badgePill}>
              <Icon name="shield-check" size={13} color={colors.primary} />
              <Text style={styles.badgePillText}>Instant Zero-Brokerage Registration</Text>
            </View>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            {/* Title */}
            <View style={styles.headingBlock}>
              <Text style={styles.title}>Create Account ✨</Text>
              <Text style={styles.subtitle}>
                Join thousands of verified owners, buyers, and tenants on Kirayedar24.
              </Text>
            </View>

            {/* Role Selection */}
            <View style={styles.roleContainer}>
              <Text style={styles.roleHeaderLabel}>I am registering as</Text>
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

            {/* Fields */}
            <FormField
              label="Full Name"
              value={name}
              onChangeText={(txt) => {
                setName(txt);
                if (errors.name) setErrors({ ...errors, name: '' });
              }}
              placeholder="e.g. Rahul Sharma"
              error={errors.name}
              required
              leftIcon={<Icon name="user" size={18} color={colors.textSecondary} />}
            />

            <FormField
              label="Email Address"
              value={email}
              onChangeText={(txt) => {
                setEmail(txt);
                if (errors.email) setErrors({ ...errors, email: '' });
              }}
              placeholder="e.g. rahul@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
              required
              leftIcon={<Icon name="mail" size={18} color={colors.textSecondary} />}
            />

            <FormField
              label="Mobile Number"
              value={phone}
              onChangeText={(txt) => {
                setPhone(txt);
                if (errors.phone) setErrors({ ...errors, phone: '' });
              }}
              placeholder="e.g. 9876543210"
              keyboardType="phone-pad"
              error={errors.phone}
              required
              leftIcon={<Icon name="phone" size={18} color={colors.textSecondary} />}
            />

            <FormField
              label="Create Password"
              value={password}
              onChangeText={(txt) => {
                setPassword(txt);
                if (errors.password) setErrors({ ...errors, password: '' });
              }}
              placeholder="At least 6 characters"
              isPassword
              error={errors.password}
              required
              leftIcon={<Icon name="lock" size={18} color={colors.textSecondary} />}
            />

            {/* Terms Agreement */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setAgreedTerms(!agreedTerms)}
              style={styles.termsRow}
            >
              <View style={[styles.checkbox, agreedTerms && styles.checkboxActive]}>
                {agreedTerms && <Icon name="check" size={13} color="#0F172A" strokeWidth={3} />}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.termsText}>
                  I agree to the{' '}
                  <Text
                    style={styles.termsLink}
                    onPress={() => navigation.navigate('TermsAndConditions')}
                  >
                    Terms & Conditions
                  </Text>{' '}
                  and Privacy Policy of Kirayedar24.
                </Text>
              </View>
            </TouchableOpacity>

            {/* Submit Button */}
            <Button
              title="Continue to Verify OTP"
              onPress={handleSignup}
              loading={loading}
              variant="primary"
              size="lg"
              fullWidth
              style={styles.submitButton}
              icon={<Icon name="arrow-right" size={18} color={colors.darkText} />}
            />

            {/* Log in prompt */}
            <View style={styles.loginRow}>
              <Text style={styles.loginPrompt}>Already have an account? </Text>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => navigation.navigate('Login')}
              >
                <Text style={styles.loginLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Security Footer */}
          <View style={styles.footer}>
            <Icon name="shield-check" size={14} color="#94A3B8" />
            <Text style={styles.footerText}>100% Data Privacy • Verified Property Owners</Text>
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
    paddingBottom: 20,
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
    marginBottom: 8,
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
    marginBottom: 16,
  },
  title: {
    ...typography.h2,
    fontSize: 22,
    color: '#0F172A',
    fontWeight: '800',
    marginBottom: 4,
  },
  subtitle: {
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
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 14,
    gap: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    backgroundColor: '#F8FAFC',
  },
  checkboxActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryDark,
  },
  termsText: {
    ...typography.caption,
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
  },
  termsLink: {
    color: colors.primaryDark,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  submitButton: {
    marginTop: 6,
    marginBottom: 16,
    borderRadius: 12,
  },
  loginRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  loginPrompt: {
    ...typography.bodyMedium,
    color: '#64748B',
    fontSize: 14,
  },
  loginLink: {
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
