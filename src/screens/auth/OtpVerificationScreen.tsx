import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types/navigation';
import { colors } from '../../theme/colors';
import { radii, spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { AppHeader } from '../../components/common/AppHeader';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';

type Props = NativeStackScreenProps<AuthStackParamList, 'OtpVerification'>;

export const OtpVerificationScreen: React.FC<Props> = ({ route, navigation }) => {
  const { phoneOrEmail, mode } = route.params;
  const { login } = useAuth();

  const [otp, setOtp] = useState(['2', '4', '8', '9', '', '']);
  const [timer, setTimer] = useState(45);
  const [loading, setLoading] = useState(false);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleOtpChange = (val: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = val;
    setOtp(newOtp);

    // Auto advance
    if (val && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = () => {
    if (!canResend) return;
    setTimer(45);
    setCanResend(false);
    Alert.alert('OTP Sent', `A new 6-digit code has been sent to ${phoneOrEmail}`);
  };

  const handleVerify = async () => {
    const fullCode = otp.join('');
    if (fullCode.length < 6) {
      Alert.alert('Incomplete Code', 'Please enter the complete 6-digit OTP code.');
      return;
    }

    setLoading(true);
    // Verified successfully in demo mode
    await login(phoneOrEmail, 'buyer');
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="OTP Verification" onBack={() => navigation.goBack()} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.content}
      >
        <Text style={styles.title}>Enter Verification Code</Text>
        <Text style={styles.subtitle}>
          We have sent a 6-digit OTP code to{' '}
          <Text style={styles.highlight}>{phoneOrEmail}</Text>
        </Text>

        <View style={styles.mockModeBanner}>
          <Text style={styles.mockModeText}>
            🧪 Demo Mode: Enter any 6-digit OTP (e.g. 248900)
          </Text>
        </View>

        {/* 6-box OTP Input */}
        <View style={styles.otpRow}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputRefs.current[index] = ref)}
              value={digit}
              onChangeText={(val) => handleOtpChange(val, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              style={[
                styles.otpBox,
                Boolean(digit) && styles.otpBoxFilled,
              ]}
              selectTextOnFocus
            />
          ))}
        </View>

        {/* Resend Timer */}
        <View style={styles.resendRow}>
          {canResend ? (
            <TouchableOpacity onPress={handleResend}>
              <Text style={styles.resendActiveText}>Resend OTP Code</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.resendTimerText}>
              Resend OTP in <Text style={styles.timerCount}>{timer}s</Text>
            </Text>
          )}
        </View>

        <Button
          title="Verify & Continue"
          onPress={handleVerify}
          loading={loading}
          variant="primary"
          size="lg"
          fullWidth
          style={styles.verifyButton}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: spacing.xl,
    alignItems: 'center',
  },
  title: {
    ...typography.h2,
    fontSize: 22,
    color: colors.darkText,
    marginTop: spacing.xl,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  highlight: {
    color: colors.darkText,
    fontWeight: '700',
  },
  mockModeBanner: {
    backgroundColor: colors.warningTint,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.primaryMuted,
    marginBottom: spacing.xxl,
  },
  mockModeText: {
    ...typography.caption,
    color: colors.primaryDark,
    fontWeight: '600',
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.sm,
  },
  otpBox: {
    width: 46,
    height: 54,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
    color: colors.darkText,
  },
  otpBoxFilled: {
    borderColor: colors.primaryDark,
    backgroundColor: colors.primarySubtle,
  },
  resendRow: {
    marginBottom: spacing.xxl,
  },
  resendTimerText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  timerCount: {
    color: colors.primaryDark,
    fontWeight: '700',
  },
  resendActiveText: {
    ...typography.bodySmall,
    color: colors.primaryDark,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  verifyButton: {
    width: '100%',
  },
});
