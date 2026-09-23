import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types/navigation';
import { colors } from '../../theme/colors';
import { radii, spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { AppHeader } from '../../components/common/AppHeader';
import { FormField } from '../../components/common/FormField';
import { Button } from '../../components/common/Button';
import { Icon } from '../../components/common/Icon';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

export const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const [identifier, setIdentifier] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendReset = async () => {
    if (!identifier.trim()) {
      setError('Please enter your registered mobile number or email');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigation.navigate('OtpVerification', {
        phoneOrEmail: identifier,
        mode: 'reset',
      });
    }, 600);
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="Forgot Password" onBack={() => navigation.goBack()} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.iconCircle}>
            <Icon name="lock" size={40} color={colors.primaryDark} strokeWidth={2} />
          </View>

          <Text style={styles.title}>Reset Your Password</Text>
          <Text style={styles.description}>
            Enter your registered mobile number or email address. We will send you a 6-digit OTP to reset your password.
          </Text>

          <FormField
            label="Mobile Number or Email"
            value={identifier}
            onChangeText={(txt) => {
              setIdentifier(txt);
              if (error) setError('');
            }}
            placeholder="e.g. 9876543210 or user@example.com"
            error={error}
            required
            leftIcon={<Icon name="mail" size={18} color={colors.textSecondary} />}
          />

          <Button
            title="Send Verification OTP"
            onPress={handleSendReset}
            loading={loading}
            variant="primary"
            size="lg"
            fullWidth
            style={styles.submitButton}
          />
        </ScrollView>
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
    padding: spacing.xl,
    alignItems: 'center',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primarySubtle,
    borderWidth: 1.5,
    borderColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.lg,
  },
  title: {
    ...typography.h2,
    fontSize: 22,
    color: colors.darkText,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  description: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xxl,
    paddingHorizontal: spacing.md,
  },
  submitButton: {
    marginTop: spacing.md,
  },
});
