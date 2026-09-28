import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Switch,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { colors } from '../../theme/colors';
import { radii, spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { AppHeader } from '../../components/common/AppHeader';
import { Icon } from '../../components/common/Icon';
import { LEGAL_VERSIONS } from '../../data/legalPolicies';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

export const SettingsScreen: React.FC<Props> = ({ navigation }) => {
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [whatsappAlerts, setWhatsappAlerts] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="Settings & Preferences" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.card}>
          <View style={styles.switchRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.switchLabel}>Push Notifications</Text>
              <Text style={styles.switchSub}>Instant alerts for inquiries, chat & bookings</Text>
            </View>
            <Switch
              value={pushNotifications}
              onValueChange={setPushNotifications}
              trackColor={{ false: colors.borderDark, true: colors.primary }}
              thumbColor={colors.surface}
            />
          </View>

          <View style={styles.switchRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.switchLabel}>WhatsApp Updates</Text>
              <Text style={styles.switchSub}>Receive verified inquiry leads on WhatsApp</Text>
            </View>
            <Switch
              value={whatsappAlerts}
              onValueChange={setWhatsappAlerts}
              trackColor={{ false: colors.borderDark, true: colors.primary }}
              thumbColor={colors.surface}
            />
          </View>

          <View style={[styles.switchRow, { borderBottomWidth: 0 }]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.switchLabel}>Email Statements</Text>
              <Text style={styles.switchSub}>Monthly rent receipts & property performance</Text>
            </View>
            <Switch
              value={emailAlerts}
              onValueChange={setEmailAlerts}
              trackColor={{ false: colors.borderDark, true: colors.primary }}
              thumbColor={colors.surface}
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Sound & Feedback</Text>
        <View style={styles.card}>
          <View style={[styles.switchRow, { borderBottomWidth: 0 }]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.switchLabel}>In-App Sounds</Text>
              <Text style={styles.switchSub}>Play audio cues for new chat messages</Text>
            </View>
            <Switch
              value={soundEnabled}
              onValueChange={setSoundEnabled}
              trackColor={{ false: colors.borderDark, true: colors.primary }}
              thumbColor={colors.surface}
            />
          </View>
        </View>

        {/* Legal & Policy Links */}
        <Text style={styles.sectionTitle}>Legal & Compliance</Text>
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.linkRow}
            onPress={() => navigation.navigate('TermsAndConditions')}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="View Terms and Conditions"
          >
            <View style={styles.linkIconCircle}>
              <Icon name="shield-check" size={16} color={colors.primaryDark} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.linkLabel}>Terms & Conditions</Text>
              <Text style={styles.linkSub}>Platform terms, zero-brokerage rules & agreement</Text>
            </View>
            <View style={styles.badgePill}>
              <Text style={styles.badgePillText}>v{LEGAL_VERSIONS.termsVersion}</Text>
            </View>
            <Icon name="chevron-right" size={14} color="#94A3B8" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.linkRow, { borderBottomWidth: 0 }]}
            onPress={() => navigation.navigate('PrivacyPolicy')}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="View Privacy Policy"
          >
            <View style={styles.linkIconCircle}>
              <Icon name="lock" size={16} color={colors.primaryDark} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.linkLabel}>Privacy Policy</Text>
              <Text style={styles.linkSub}>Data security, contact masking & DPDPA rights</Text>
            </View>
            <View style={styles.badgePill}>
              <Text style={styles.badgePillText}>v{LEGAL_VERSIONS.privacyVersion}</Text>
            </View>
            <Icon name="chevron-right" size={14} color="#94A3B8" />
          </TouchableOpacity>
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
    paddingBottom: spacing.xxxl,
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
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: spacing.sm + 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  linkIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkLabel: {
    ...typography.subtitle,
    fontSize: 14,
    fontWeight: '700',
    color: colors.darkText,
  },
  linkSub: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 1,
  },
  badgePill: {
    backgroundColor: colors.primarySubtle,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primaryLight,
  },
  badgePillText: {
    ...typography.badge,
    fontSize: 10,
    color: colors.primaryDark,
    fontWeight: '800',
  },
});

