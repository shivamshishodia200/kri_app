import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { useNotification } from '../../context/NotificationContext';
import { AppNotification, NotificationCategory } from '../../types/notification';
import { EmptyState } from '../../components/common/EmptyState';
import { Icon, IconName } from '../../components/common/Icon';

type Props = NativeStackScreenProps<RootStackParamList, 'NotificationList'>;

const CATEGORIES: { id: string; label: string }[] = [
  { id: 'all', label: 'All Alerts' },
  { id: 'inquiry', label: 'Inquiries' },
  { id: 'price_drop', label: 'Price Drops' },
  { id: 'booking', label: 'Bookings' },
  { id: 'payment', label: 'Rent Pay' },
];

export const NotificationListScreen: React.FC<Props> = ({ navigation }) => {
  const { notifications, markAsRead, markAllAsRead } = useNotification();
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredNotifications = notifications.filter((n) => {
    if (selectedCategory === 'all') return true;
    return n.category === selectedCategory;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getCategoryTheme = (cat: NotificationCategory): { icon: IconName; bg: string; color: string } => {
    switch (cat) {
      case 'inquiry':
        return { icon: 'chat', bg: '#DCFCE7', color: '#166534' };
      case 'price_drop':
        return { icon: 'sparkles', bg: '#FEF0C7', color: '#B54708' };
      case 'booking':
        return { icon: 'calendar', bg: '#E0F2FE', color: '#0369A1' };
      case 'payment':
        return { icon: 'credit-card', bg: '#F3E8FF', color: '#6B21A8' };
      case 'system':
      default:
        return { icon: 'bell', bg: 'rgba(253, 176, 34, 0.15)', color: colors.primaryDark };
    }
  };

  const handleNotificationPress = (notif: AppNotification) => {
    markAsRead(notif.id);
    if (notif.targetScreen === 'PropertyDetail' && notif.targetId) {
      navigation.navigate('PropertyDetail', { propertyId: notif.targetId });
    } else if (notif.targetScreen === 'ChatDetail' && notif.targetId) {
      navigation.navigate('ChatDetail', { threadId: notif.targetId });
    } else if (notif.targetScreen === 'MyBookings') {
      navigation.navigate('MyBookings');
    } else if (notif.targetScreen === 'PayRent') {
      navigation.navigate('PayRent');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0F19" />

      {/* Top Luxury Midnight Header */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Icon name="chevron-left" size={22} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.headerTitleBlock}>
            <Text style={styles.headerTitle}>Notifications</Text>
            <Text style={styles.headerSubtitle}>
              {unreadCount > 0 ? `${unreadCount} unread alerts` : 'All caught up'}
            </Text>
          </View>

          {unreadCount > 0 ? (
            <TouchableOpacity onPress={markAllAsRead} activeOpacity={0.8}>
              <Text style={styles.markAllRead}>Mark all read</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ width: 40 }} />
          )}
        </View>

        {/* Filter Tabs */}
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.tabsScroll}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setSelectedCategory(item.id)}
              style={[
                styles.tabPill,
                selectedCategory === item.id && styles.tabPillActive,
              ]}
            >
              <Text
                style={[
                  styles.tabLabel,
                  selectedCategory === item.id && styles.tabLabelActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Notifications List */}
      <FlatList
        data={filteredNotifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const theme = getCategoryTheme(item.category);
          return (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleNotificationPress(item)}
              style={[
                styles.notifCard,
                !item.isRead && styles.notifCardUnread,
              ]}
            >
              {/* Unread Left Border Strip */}
              {!item.isRead && <View style={styles.unreadStrip} />}

              {/* Icon Bubble */}
              <View style={[styles.iconBubble, { backgroundColor: theme.bg }]}>
                <Icon name={theme.icon} size={20} color={theme.color} />
              </View>

              {/* Text Info */}
              <View style={styles.cardContent}>
                <View style={styles.cardTopRow}>
                  <Text style={styles.cardTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={styles.cardTime}>{item.timestamp}</Text>
                </View>

                <Text style={styles.cardMessage} numberOfLines={2}>
                  {item.body}
                </Text>

                {item.targetScreen && (
                  <View style={styles.cardActionRow}>
                    <Text style={styles.cardActionText}>View Details →</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        }}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <EmptyState
              icon="bell"
              title="No Notifications"
              description="You're all caught up! Updates regarding property visits, chats, price drops, and rent reminders will appear here."
            />
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#0B0F19',
    paddingTop: Platform.OS === 'ios' ? 44 : 16,
    paddingHorizontal: 18,
    paddingBottom: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  headerTitleBlock: {
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.h2,
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  headerSubtitle: {
    ...typography.caption,
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  markAllRead: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
    fontSize: 12,
  },
  tabsScroll: {
    gap: 8,
  },
  tabPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  tabPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabLabel: {
    ...typography.caption,
    color: '#94A3B8',
    fontWeight: '600',
    fontSize: 12,
  },
  tabLabelActive: {
    color: '#0F172A',
    fontWeight: '800',
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 10,
  },
  notifCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  notifCardUnread: {
    backgroundColor: '#FFFDF9',
    borderColor: 'rgba(253, 176, 34, 0.3)',
  },
  unreadStrip: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 4,
    backgroundColor: colors.primary,
  },
  iconBubble: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  cardTitle: {
    ...typography.subtitle,
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
    marginRight: 8,
  },
  cardTime: {
    ...typography.caption,
    fontSize: 11,
    color: '#94A3B8',
  },
  cardMessage: {
    ...typography.bodySmall,
    color: '#64748B',
    fontSize: 12,
    lineHeight: 17,
  },
  cardActionRow: {
    marginTop: 8,
  },
  cardActionText: {
    ...typography.caption,
    color: colors.primaryDark,
    fontWeight: '800',
    fontSize: 12,
  },
  emptyContainer: {
    paddingTop: 60,
  },
});
