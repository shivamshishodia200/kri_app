import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { colors } from '../../theme/colors';
import { radii, spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { Property } from '../../types/property';
import { FormField } from '../common/FormField';
import { Button } from '../common/Button';
import { Icon } from '../common/Icon';
import { useProperty } from '../../context/PropertyContext';
import { useAuth } from '../../context/AuthContext';

interface InquiryModalProps {
  visible: boolean;
  onClose: () => void;
  property: Property;
  onSuccess?: () => void;
}

export const InquiryModal: React.FC<InquiryModalProps> = ({
  visible,
  onClose,
  property,
  onSuccess,
}) => {
  const { user } = useAuth();
  const { sendInquiry } = useProperty();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [message, setMessage] = useState(
    `Hi ${property.owner.name}, I am interested in "${property.title}". Please share details on scheduling an in-person visit.`
  );
  const [inquiryType, setInquiryType] = useState<'visit' | 'pricing' | 'general'>('visit');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!phone.trim()) {
      Alert.alert('Phone Required', 'Please provide your contact number for the owner to respond.');
      return;
    }

    setLoading(true);
    await sendInquiry(property.id, message, phone);
    setLoading(false);

    Alert.alert(
      'Inquiry Sent! 🎉',
      `Your inquiry has been directly forwarded to ${property.owner.name} (${property.owner.role}). They will contact you shortly.`,
      [
        {
          text: 'Great',
          onPress: () => {
            onClose();
            if (onSuccess) onSuccess();
          },
        },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>Contact Landlord / Agent</Text>
              <Text style={styles.headerSubtitle}>
                Inquiring for: {property.location.locality}, {property.location.city}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={22} color={colors.darkText} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body}>
            {/* Quick intent chips */}
            <Text style={styles.fieldLabel}>What are you looking for?</Text>
            <View style={styles.intentRow}>
              {[
                { id: 'visit', label: '📅 Schedule Visit' },
                { id: 'pricing', label: '💰 Discuss Price' },
                { id: 'general', label: 'ℹ️ Check Availability' },
              ].map((item) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => setInquiryType(item.id as any)}
                  style={[
                    styles.intentChip,
                    inquiryType === item.id && styles.intentChipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.intentText,
                      inquiryType === item.id && styles.intentTextActive,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <FormField
              label="Your Full Name"
              value={name}
              onChangeText={setName}
              placeholder="e.g. Rajesh Sharma"
              leftIcon={<Icon name="user" size={18} color={colors.textSecondary} />}
            />

            <FormField
              label="Contact Phone Number"
              value={phone}
              onChangeText={setPhone}
              placeholder="e.g. +91 98765 43210"
              keyboardType="phone-pad"
              required
              leftIcon={<Icon name="phone" size={18} color={colors.textSecondary} />}
            />

            <FormField
              label="Message to Landlord"
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={4}
              placeholder="Write your questions or preferred visit timing..."
            />

            <View style={styles.securityNote}>
              <Icon name="shield-check" size={18} color={colors.success} />
              <Text style={styles.securityText}>
                Your contact details are protected under Kirayedar24 Zero-Spam Guarantee.
              </Text>
            </View>

            <Button
              title="Send Direct Inquiry"
              onPress={handleSubmit}
              loading={loading}
              variant="primary"
              size="lg"
              fullWidth
              style={{ marginTop: spacing.md }}
            />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.xxl,
    borderTopRightRadius: radii.xxl,
    maxHeight: '85%',
    paddingBottom: Platform.OS === 'ios' ? spacing.xxl : spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    ...typography.h3,
    fontSize: 18,
    color: colors.darkText,
  },
  headerSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  closeButton: {
    padding: spacing.xs,
  },
  body: {
    padding: spacing.lg,
  },
  fieldLabel: {
    ...typography.subtitle,
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs + 2,
  },
  intentRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs + 2,
    marginBottom: spacing.md,
  },
  intentChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radii.round,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
  },
  intentChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryDark,
  },
  intentText: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  intentTextActive: {
    color: colors.darkText,
    fontWeight: '700',
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.successTint,
    padding: spacing.md,
    borderRadius: radii.lg,
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  securityText: {
    ...typography.caption,
    color: colors.successDark,
    flex: 1,
    lineHeight: 16,
  },
});
