import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { Button } from './Button';
import { Icon } from './Icon';
import { PaymentPendingModal } from './PaymentPendingModal';

interface ContactUnlockModalProps {
  visible: boolean;
  onClose: () => void;
  ownerName: string;
  propertyTitle: string;
}

export const ContactUnlockModal: React.FC<ContactUnlockModalProps> = ({
  visible,
  onClose,
  ownerName,
  propertyTitle,
}) => {
  const [showPendingPayment, setShowPendingPayment] = useState(false);

  const handleUnlockPress = () => {
    setShowPendingPayment(true);
  };

  return (
    <>
      <Modal
        visible={visible && !showPendingPayment}
        transparent
        animationType="slide"
        onRequestClose={onClose}
      >
        <Pressable style={styles.backdrop} onPress={onClose}>
          <Pressable style={styles.container} onPress={(e) => e.stopPropagation()}>
            <View style={styles.header}>
              <View style={styles.iconCircle}>
                <Icon name="lock" size={26} color={colors.primaryDark} />
              </View>
              <Text style={styles.title}>Unlock Owner Contact</Text>
              <Text style={styles.subtitle} numberOfLines={2}>
                {propertyTitle}
              </Text>
            </View>

            <View style={styles.ownerCard}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {ownerName.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.ownerInfo}>
                <Text style={styles.ownerName}>{ownerName}</Text>
                <View style={styles.maskedRow}>
                  <Icon name="phone" size={14} color={colors.textSecondary} />
                  <Text style={styles.maskedPhone}>+91 98XXX XXXXX</Text>
                </View>
              </View>
              <View style={styles.verifiedBadge}>
                <Icon name="check" size={12} color={colors.successDark} />
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            </View>

            <View style={styles.benefitsBox}>
              <Text style={styles.benefitsTitle}>What you will get:</Text>
              <View style={styles.benefitItem}>
                <Icon name="check" size={14} color={colors.primaryDark} />
                <Text style={styles.benefitText}>Direct phone call & WhatsApp access</Text>
              </View>
              <View style={styles.benefitItem}>
                <Icon name="check" size={14} color={colors.primaryDark} />
                <Text style={styles.benefitText}>Direct email ID of property owner</Text>
              </View>
              <View style={styles.benefitItem}>
                <Icon name="check" size={14} color={colors.primaryDark} />
                <Text style={styles.benefitText}>Instant schedule visit request</Text>
              </View>
            </View>

            <View style={styles.pricingCard}>
              <View>
                <Text style={styles.priceLabel}>Single Contact Unlock</Text>
                <Text style={styles.priceAmount}>₹49 <Text style={styles.gstText}>+ GST</Text></Text>
              </View>
              <View style={styles.tagBadge}>
                <Text style={styles.tagText}>Direct Connect</Text>
              </View>
            </View>

            <View style={styles.actionButtons}>
              <Button
                title="Unlock Contact (₹49)"
                variant="primary"
                size="lg"
                fullWidth
                onPress={handleUnlockPress}
                accessibilityLabel="Proceed to unlock owner contact"
              />
              <Button
                title="Cancel"
                variant="ghost"
                size="md"
                fullWidth
                onPress={onClose}
                style={styles.cancelBtn}
                accessibilityLabel="Close unlock modal"
              />
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <PaymentPendingModal
        visible={showPendingPayment}
        onClose={() => {
          setShowPendingPayment(false);
          onClose();
        }}
        title="Contact Access Gateway"
        featureName="Direct Owner Contact Unlock"
        amount={49}
        description="Direct owner phone numbers and WhatsApp access require verification via the payment gateway. Live transaction processing is pending backend server configuration."
      />
    </>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 36,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: colors.primaryLight,
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  ownerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSubtle,
    padding: 16,
    borderRadius: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    ...typography.h3,
    color: colors.textDark,
    fontWeight: '700',
  },
  ownerInfo: {
    flex: 1,
  },
  ownerName: {
    ...typography.subtitle,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: 2,
  },
  maskedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  maskedPhone: {
    ...typography.caption,
    color: colors.textSecondary,
    fontFamily: 'monospace',
    fontWeight: '500',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.successTint,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  verifiedText: {
    fontSize: 11,
    color: colors.successDark,
    fontWeight: '600',
  },
  benefitsBox: {
    backgroundColor: colors.primarySubtle,
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  benefitsTitle: {
    ...typography.caption,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: 4,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  benefitText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 12,
  },
  pricingCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: 14,
    marginBottom: 20,
  },
  priceLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  priceAmount: {
    ...typography.h3,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  gstText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '400',
  },
  tagBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 11,
    color: colors.primaryDark,
    fontWeight: '700',
  },
  actionButtons: {
    gap: 8,
  },
  cancelBtn: {
    marginTop: 4,
  },
});
