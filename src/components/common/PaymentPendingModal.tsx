import React from 'react';
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

interface PaymentPendingModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  featureName: string;
  amount?: number;
  description?: string;
}

export const PaymentPendingModal: React.FC<PaymentPendingModalProps> = ({
  visible,
  onClose,
  title = 'Payment Gateway Notice',
  featureName,
  amount,
  description,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.container} onPress={(e) => e.stopPropagation()}>
          <View style={styles.iconCircle}>
            <Icon name="shield-check" size={32} color={colors.primaryDark} />
          </View>

          <Text style={styles.title}>{title}</Text>

          {amount ? (
            <View style={styles.amountBadge}>
              <Text style={styles.amountLabel}>Payable Amount</Text>
              <Text style={styles.amountValue}>₹{amount.toLocaleString('en-IN')}</Text>
            </View>
          ) : null}

          <Text style={styles.description}>
            {description ||
              `The payment gateway integration for ${featureName} is currently in preview mode. Live transactions and instant automated verification require server-side gateway keys.`}
          </Text>

          <View style={styles.infoBox}>
            <Icon name="info" size={18} color={colors.info} />
            <Text style={styles.infoText}>
              No money will be deducted from your account. Production payments (UPI, Cards, NetBanking via Razorpay) will be active upon live backend connection.
            </Text>
          </View>

          <View style={styles.buttonRow}>
            <Button
              title="Understood"
              variant="primary"
              size="lg"
              fullWidth
              onPress={onClose}
              accessibilityLabel="Dismiss payment notice"
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: colors.primaryLight,
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 12,
  },
  amountBadge: {
    backgroundColor: colors.surfaceSubtle,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  amountLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  amountValue: {
    ...typography.h2,
    color: colors.primaryDark,
    fontWeight: '700',
  },
  description: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.infoTint,
    padding: 12,
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: colors.info,
    marginBottom: 20,
    gap: 8,
  },
  infoText: {
    ...typography.caption,
    color: colors.textPrimary,
    flex: 1,
    lineHeight: 18,
  },
  buttonRow: {
    width: '100%',
  },
});
