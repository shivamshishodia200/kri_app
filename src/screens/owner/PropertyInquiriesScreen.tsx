import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { colors } from '../../theme/colors';
import { radii, spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { AppHeader } from '../../components/common/AppHeader';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { Icon } from '../../components/common/Icon';

type Props = NativeStackScreenProps<RootStackParamList, 'PropertyInquiries'>;

interface InquiryItem {
  id: string;
  propertyTitle: string;
  inquirerName: string;
  inquirerPhone: string;
  intent: 'Visit Request' | 'Price Discussion' | 'General Query';
  message: string;
  receivedAt: string;
}

const INQUIRIES_DATA: InquiryItem[] = [
  {
    id: 'inq-101',
    propertyTitle: 'Luxury 3 BHK Penthouse Indiranagar',
    inquirerName: 'Ananya Roy',
    inquirerPhone: '+91 98450 99881',
    intent: 'Visit Request',
    message: 'We are a family of 4 looking to move by 1st of next month. Can we visit on Saturday at 3 PM?',
    receivedAt: '25 mins ago',
  },
  {
    id: 'inq-102',
    propertyTitle: 'Modern 2 BHK Gated Community Apartment',
    inquirerName: 'Karan Mehra',
    inquirerPhone: '+91 99112 33445',
    intent: 'General Query',
    message: 'Is the apartment available for IT working professionals? Also is maintenance included?',
    receivedAt: '2 hours ago',
  },
  {
    id: 'inq-103',
    propertyTitle: 'Luxury 3 BHK Penthouse Indiranagar',
    inquirerName: 'Sanjay Reddy',
    inquirerPhone: '+91 97400 12345',
    intent: 'Price Discussion',
    message: 'Interested for a 2-year lease. Is the rent negotiable for advance payment of 6 months?',
    receivedAt: 'Yesterday',
  },
];

export const PropertyInquiriesScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="Tenant Inquiries & Leads" onBack={() => navigation.goBack()} />

      <FlatList
        data={INQUIRIES_DATA}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.inquiryCard}>
            <View style={styles.cardHeader}>
              <View style={styles.intentBadge}>
                <Text style={styles.intentText}>{item.intent}</Text>
              </View>
              <Text style={styles.timeText}>{item.receivedAt}</Text>
            </View>

            <Text style={styles.propertyTitle}>🏠 {item.propertyTitle}</Text>

            <View style={styles.userRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.inquirerName[0]}</Text>
              </View>
              <View>
                <Text style={styles.userName}>{item.inquirerName}</Text>
                <Text style={styles.userPhone}>{item.inquirerPhone}</Text>
              </View>
            </View>

            <View style={styles.messageBox}>
              <Text style={styles.messageText}>"{item.message}"</Text>
            </View>

            <View style={styles.actionRow}>
              <Button
                title="Call Inquirer"
                variant="outline"
                size="sm"
                onPress={() => Alert.alert('Call', `Calling ${item.inquirerPhone}`)}
                icon={<Icon name="phone" size={14} color={colors.primaryDark} />}
                style={{ flex: 1 }}
              />
              <Button
                title="Reply in Chat"
                variant="primary"
                size="sm"
                onPress={() => navigation.navigate('ChatList')}
                icon={<Icon name="chat" size={14} color={colors.darkText} />}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon="chat"
            title="No Inquiries Yet"
            description="Tenant inquiries and visit requests for your properties will appear here."
          />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  inquiryCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  intentBadge: {
    backgroundColor: colors.primarySubtle,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 2,
    borderRadius: radii.round,
  },
  intentText: {
    ...typography.badge,
    fontSize: 10,
    color: colors.primaryDark,
    fontWeight: '700',
  },
  timeText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
  },
  propertyTitle: {
    ...typography.subtitle,
    fontSize: 14,
    fontWeight: '700',
    color: colors.darkText,
    marginBottom: spacing.sm,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatarText: {
    ...typography.subtitle,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  userName: {
    ...typography.subtitle,
    fontSize: 13,
    fontWeight: '700',
    color: colors.darkText,
  },
  userPhone: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
  },
  messageBox: {
    backgroundColor: colors.surfaceSubtle,
    padding: spacing.sm,
    borderRadius: radii.md,
    marginBottom: spacing.md,
  },
  messageText: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
});
