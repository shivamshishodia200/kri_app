import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Linking,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { colors } from '../../theme/colors';
import { radii, spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { AppHeader } from '../../components/common/AppHeader';
import { FormField } from '../../components/common/FormField';
import { Button } from '../../components/common/Button';
import { Icon } from '../../components/common/Icon';

type Props = NativeStackScreenProps<RootStackParamList, 'ContactUs'>;

export const ContactUsScreen: React.FC<Props> = ({ navigation }) => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    if (!subject.trim() || !message.trim()) {
      Alert.alert('Required', 'Please enter your message subject and description.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        'Ticket Created #KIR-8924',
        'Our customer support manager will respond to you within 2 hours.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    }, 600);
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="Contact Support" onBack={() => navigation.goBack()} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Quick Contact Channels */}
          <Text style={styles.sectionTitle}>Direct Channels</Text>
          <View style={styles.channelsGrid}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => Linking.openURL('tel:+91800002424').catch(() => {})}
              style={styles.channelCard}
            >
              <View style={[styles.iconCircle, { backgroundColor: '#DCFCE7' }]}>
                <Icon name="phone" size={20} color="#166534" />
              </View>
              <Text style={styles.channelTitle}>Phone Helpline</Text>
              <Text style={styles.channelSub}>1800-24-24-24 (Toll Free)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => Linking.openURL('mailto:support@kirayedar24.com').catch(() => {})}
              style={styles.channelCard}
            >
              <View style={[styles.iconCircle, { backgroundColor: '#E0F2FE' }]}>
                <Icon name="mail" size={20} color="#0369A1" />
              </View>
              <Text style={styles.channelTitle}>Email Support</Text>
              <Text style={styles.channelSub}>support@kirayedar24.com</Text>
            </TouchableOpacity>
          </View>

          {/* Inquiry Form */}
          <Text style={styles.sectionTitle}>Send Us a Message</Text>
          <View style={styles.formCard}>
            <FormField
              label="Subject / Topic"
              value={subject}
              onChangeText={setSubject}
              placeholder="e.g. Rent Agreement query or Owner verification"
              required
            />

            <FormField
              label="Message Description"
              value={message}
              onChangeText={setMessage}
              placeholder="Please describe your question or issue in detail..."
              multiline
              numberOfLines={4}
              required
            />

            <Button
              title="Submit Support Request"
              onPress={handleSubmit}
              loading={loading}
              variant="primary"
              size="lg"
              fullWidth
              style={{ marginTop: spacing.sm }}
            />
          </View>
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
    paddingBottom: spacing.xxxl,
  },
  sectionTitle: {
    ...typography.subtitle,
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    marginLeft: 4,
  },
  channelsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  channelCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  channelTitle: {
    ...typography.subtitle,
    fontSize: 13,
    fontWeight: '700',
    color: colors.darkText,
    marginBottom: 2,
  },
  channelSub: {
    ...typography.caption,
    fontSize: 10,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
