import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  StatusBar,
  Platform,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { useChat } from '../../context/ChatContext';
import { ChatThread } from '../../types/chat';
import { EmptyState } from '../../components/common/EmptyState';
import { Icon } from '../../components/common/Icon';
import { propertyService } from '../../services/propertyService';

export const ChatListScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { threads, markThreadAsRead } = useChat();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const unreadTotal = threads.reduce((acc, t) => acc + (t.unreadCount || 0), 0);

  const filteredThreads = threads.filter((t) => {
    if (filter === 'unread') return t.unreadCount > 0;
    return true;
  });

  const handleOpenChat = async (thread: ChatThread) => {
    if (thread.propertyId) {
      const entitlement = await propertyService.checkContactEntitlement(thread.propertyId);
      if (!entitlement.allowed) {
        Alert.alert(
          'Contact access required',
          'This property conversation is unavailable until the server confirms contact access.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'View listing',
              onPress: () => navigation.navigate('PropertyDetail', { propertyId: thread.propertyId! }),
            },
          ]
        );
        return;
      }
    }
    markThreadAsRead(thread.id);
    navigation.navigate('ChatDetail', {
      threadId: thread.id,
      title: thread.participant.name,
      participantName: thread.participant.name,
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0F19" />

      {/* Top Luxury Midnight Header */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <View>
            <View style={styles.badgePill}>
              <Icon name="chat" size={12} color={colors.primary} />
              <Text style={styles.badgePillText}>DIRECT MESSAGING HUB</Text>
            </View>
            <Text style={styles.headerTitle}>Messages & Inquiries</Text>
            <Text style={styles.headerSubtitle}>
              Chat directly with verified landlords and tenants
            </Text>
          </View>

          {unreadTotal > 0 && (
            <View style={styles.unreadHeaderBadge}>
              <Text style={styles.unreadHeaderBadgeText}>{unreadTotal} New</Text>
            </View>
          )}
        </View>

        {/* Filter Pills */}
        <View style={styles.filterTabs}>
          <TouchableOpacity
            style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
            onPress={() => setFilter('all')}
            activeOpacity={0.8}
          >
            <Text style={[styles.filterTabText, filter === 'all' && styles.filterTabTextActive]}>
              All Messages ({threads.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterTab, filter === 'unread' && styles.filterTabActive]}
            onPress={() => setFilter('unread')}
            activeOpacity={0.8}
          >
            <Text style={[styles.filterTabText, filter === 'unread' && styles.filterTabTextActive]}>
              Unread Only ({unreadTotal})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Threads List */}
      <FlatList
        data={filteredThreads}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => handleOpenChat(item)}
            style={[
              styles.threadCard,
              item.unreadCount > 0 && styles.threadCardUnread,
            ]}
          >
            {/* Avatar & Online Status */}
            <View style={styles.avatarWrapper}>
              {item.propertyImage ? (
                <Image source={{ uri: item.propertyImage }} style={styles.avatarImg} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>{item.participant.name[0]}</Text>
                </View>
              )}
              {item.participant.isOnline && <View style={styles.onlinePulse} />}
            </View>

            {/* Conversation Details */}
            <View style={styles.metaColumn}>
              <View style={styles.metaTop}>
                <Text style={styles.participantName}>{item.participant.name}</Text>
                <Text style={styles.timeText}>{item.lastMessageTime}</Text>
              </View>

              {item.propertyTitle && (
                <View style={styles.propertyPill}>
                  <Icon name="home" size={11} color={colors.primaryDark} />
                  <Text style={styles.propertyPillText} numberOfLines={1}>
                    {item.propertyTitle}
                  </Text>
                </View>
              )}

              <Text
                style={[
                  styles.lastMessageText,
                  item.unreadCount > 0 && styles.lastMessageTextBold,
                ]}
                numberOfLines={1}
              >
                {item.lastMessage}
              </Text>
            </View>

            {/* Unread Count Badge */}
            {item.unreadCount > 0 && (
              <View style={styles.unreadCounter}>
                <Text style={styles.unreadCounterText}>{item.unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <EmptyState
              icon="chat"
              title="No Inquiries Yet"
              description="When you contact a property owner or receive a tenant question, your conversation threads will appear here."
              actionTitle="Browse Properties"
              onAction={() => navigation.navigate('SearchListings')}
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
    paddingTop: Platform.OS === 'ios' ? 48 : 20,
    paddingHorizontal: 20,
    paddingBottom: 18,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(253, 176, 34, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(253, 176, 34, 0.3)',
    gap: 6,
    marginBottom: 8,
  },
  badgePillText: {
    ...typography.badge,
    color: colors.primary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  headerTitle: {
    ...typography.h2,
    fontSize: 22,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  headerSubtitle: {
    ...typography.caption,
    color: '#94A3B8',
    marginTop: 4,
    fontSize: 13,
  },
  unreadHeaderBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  unreadHeaderBadgeText: {
    ...typography.badge,
    color: '#0F172A',
    fontWeight: '800',
    fontSize: 11,
  },
  filterTabs: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  filterTab: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  filterTabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterTabText: {
    ...typography.caption,
    color: '#94A3B8',
    fontWeight: '600',
    fontSize: 12,
  },
  filterTabTextActive: {
    color: '#0F172A',
    fontWeight: '800',
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 10,
  },
  threadCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  threadCardUnread: {
    borderColor: 'rgba(253, 176, 34, 0.4)',
    backgroundColor: '#FFFDF9',
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 14,
  },
  avatarImg: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#E2E8F0',
  },
  avatarPlaceholder: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(253, 176, 34, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(253, 176, 34, 0.3)',
  },
  avatarText: {
    ...typography.h3,
    color: colors.primaryDark,
    fontWeight: '800',
    fontSize: 18,
  },
  onlinePulse: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 13,
    height: 13,
    borderRadius: 6.5,
    backgroundColor: '#12B76A',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  metaColumn: {
    flex: 1,
  },
  metaTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  participantName: {
    ...typography.subtitle,
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  timeText: {
    ...typography.caption,
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  propertyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    backgroundColor: 'rgba(253, 176, 34, 0.1)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 4,
    maxWidth: '90%',
  },
  propertyPillText: {
    ...typography.caption,
    fontSize: 10,
    color: colors.primaryDark,
    fontWeight: '700',
  },
  lastMessageText: {
    ...typography.bodySmall,
    color: '#64748B',
    fontSize: 12,
  },
  lastMessageTextBold: {
    color: '#0F172A',
    fontWeight: '700',
  },
  unreadCounter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  unreadCounterText: {
    color: '#0F172A',
    fontSize: 11,
    fontWeight: '800',
  },
  emptyContainer: {
    paddingTop: 60,
  },
});
