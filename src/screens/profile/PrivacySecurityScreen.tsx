import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { colors } from '../../theme/colors';
import { radii, spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { AppHeader } from '../../components/common/AppHeader';
import { Button } from '../../components/common/Button';

type Props = NativeStackScreenProps<RootStackParamList, 'PrivacySecurity'>;

export const PrivacySecurityScreen: React.FC<Props> = ({ navigation }) => {
  const [hidePhone, setHidePhone] = useState(false);
  const [twoFactorAuth, setTwoFactorAuth] = useState(true);

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="Privacy & Security" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Privacy Controls</Text>
        <View style={styles.card}>
          <View style={styles.switchRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.switchLabel}>Mask Phone on Listings</Text>
              <Text style={styles.switchSub}>Only verified inquirers can see your contact number</Text>
            </View>
            <Switch
              value={hidePhone}
              onValueChange={setHidePhone}
              trackColor={{ false: colors.borderDark, true: colors.primary }}
              thumbColor={colors.surface}
            />
          </View>

          <View style={[styles.switchRow, { borderBottomWidth: 0 }]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.switchLabel}>Two-Factor Authentication (2FA)</Text>
              <Text style={styles.switchSub}>Require SMS OTP verification on every login</Text>
            </View>
            <Switch
              value={twoFactorAuth}
              onValueChange={setTwoFactorAuth}
              trackColor={{ false: colors.borderDark, true: colors.primary }}
              thumbColor={colors.surface}
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Account Data</Text>
        <View style={styles.card}>
          <Text style={styles.dataNotice}>
            Kirayedar24 uses 256-bit encryption for all identity verifications and payment records. You can request an export of your account data or permanently delete your account below.
          </Text>

          <Button
            title="Download My Personal Data"
            variant="outline"
            size="md"
            onPress={() => Alert.alert('Data Export', 'Your data archive has been sent to your registered email.')}
            fullWidth
            style={{ marginBottom: spacing.md }}
          />

          <Button
            title="Read Complete Privacy Policy"
            variant="secondary"
            size="md"
            onPress={() => navigation.navigate('PrivacyPolicy')}
            fullWidth
            style={{ marginBottom: spacing.md }}
          />

          <Button
            title="Request Account Deletion"
            variant="danger"
            size="md"
            onPress={() =>
              Alert.alert('Delete Account', 'Account deletion request submitted to security team.')
            }
            fullWidth
          />
        </View>

      </ScrollView>
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
  },
  sectionTitle: {
    ...typography.subtitle,
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs + 2,
    marginLeft: 4,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xl,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  switchLabel: {
    ...typography.subtitle,
    fontSize: 14,
    fontWeight: '600',
    color: colors.darkText,
  },
  switchSub: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  dataNotice: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
});
