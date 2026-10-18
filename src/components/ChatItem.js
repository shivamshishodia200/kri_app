/**
 * ChatItem Component
 * Displays individual chat preview in ChatListScreen with Neumorphic styling
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import moment from 'moment';

const colors = {
  primary: '#FDB022',
  primaryDark: '#D97706',
  primaryLight: '#FFF8EB',
  white: '#FFFFFF',
  text: '#2D3748',
  lightText: '#626B78',
  unread: '#EF4444',
  greyLight: '#E5E3DC',
  borderHighlight: '#FFFFFF',
  borderShadow: '#D8D5CB',
  cardBg: '#EFEEE9',
};

const getInitials = (fullName) => {
  if (!fullName || fullName === 'User') return 'U';
  const parts = fullName.split(' ').filter(Boolean);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  if (parts.length >= 2) return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
  return 'U';
};

const ChatItem = ({ chat, onPress, onDelete, currentUserId }) => {
  let otherParticipant = null;
  let participantRole = null;
  
  const owner = chat.owner || null;
  const tenant = chat.tenant || null;
  
  if (owner && tenant) {
    const ownerId = owner._id || owner.id;
    if (String(ownerId) === String(currentUserId)) {
      otherParticipant = tenant;
      participantRole = tenant.role || 'Tenant';
    } else {
      otherParticipant = owner;
      participantRole = owner.role || 'Owner';
    }
  } else if (owner) {
    otherParticipant = owner;
    participantRole = owner.role || 'Owner';
  } else if (tenant) {
    otherParticipant = tenant;
    participantRole = tenant.role || 'Tenant';
  } else {
    const participants = chat.participants || [];
    otherParticipant = participants.find(
      p => p?._id?.toString() !== currentUserId?.toString() && p?.id?.toString() !== currentUserId?.toString()
    ) || participants[0] || {};
  }
  
  const participantName = otherParticipant?.fullName 
    || otherParticipant?.name 
    || otherParticipant?.firstName 
    || (otherParticipant?.firstName && otherParticipant?.lastName 
        ? `${otherParticipant.firstName} ${otherParticipant.lastName}` 
        : null)
    || chat.ownerName
    || 'User';
    
  const participantImage = otherParticipant?.profilePicture 
    || otherParticipant?.avatar 
    || otherParticipant?.image 
    || null;
  
  const propertyTitle = chat.propertyTitle || chat.property?.title || 'Property Inquiry';
  
  let lastMessage = 'Tap to start chatting';
  
  if (chat.lastMessage?.text) {
    lastMessage = chat.lastMessage.text;
  } else if (chat.lastMessage?.content) {
    lastMessage = chat.lastMessage.content;
  } else if (chat.lastMessage?.message) {
    lastMessage = chat.lastMessage.message;
  } else if (chat.messages && chat.messages.length > 0) {
    const lastMsg = chat.messages[chat.messages.length - 1];
    lastMessage = lastMsg?.text || lastMsg?.content || lastMsg?.message || lastMessage;
  }
  
  const timestamp = chat.updatedAt || chat.createdAt;
  const unreadCount = chat.unreadCount || 0;

  const formatTimestamp = (time) => {
    if (!time) return '';
    
    const messageDate = moment(time);
    const now = moment();
    
    if (messageDate.isSame(now, 'day')) {
      return messageDate.format('h:mm A');
    }
    if (messageDate.isSame(now.clone().subtract(1, 'day'), 'day')) {
      return 'Yesterday';
    }
    if (messageDate.isSame(now, 'week')) {
      return messageDate.format('ddd');
    }
    if (messageDate.isSame(now, 'year')) {
      return messageDate.format('MMM D');
    }
    return messageDate.format('MMM D, YYYY');
  };

  return (
    <TouchableOpacity
      style={[styles.container, unreadCount > 0 && styles.unreadContainer]}
      onPress={() => onPress(chat)}
      onLongPress={() => onDelete && onDelete(chat)}
      activeOpacity={0.8}
    >
      {/* Profile Picture / Initials Avatar */}
      <View style={styles.avatarContainer}>
        {participantImage ? (
          <Image
            source={{ uri: participantImage }}
            style={styles.avatar}
            defaultSource={{ uri: 'https://via.placeholder.com/100x100.png?text=User' }}
          />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Text style={styles.avatarInitials}>{getInitials(participantName)}</Text>
          </View>
        )}
      </View>

      {/* Chat Content */}
      <View style={styles.content}>
        {/* Participant Name & Role */}
        <View style={styles.topContentRow}>
          <Text style={styles.ownerName} numberOfLines={1}>
            {participantName}
          </Text>
          {participantRole ? (
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{participantRole}</Text>
            </View>
          ) : null}
        </View>

        {/* Property Context Title */}
        <View style={styles.propertyRow}>
          <Icon name="home-outline" size={11} color={colors.primaryDark} style={{ marginRight: 3 }} />
          <Text style={styles.propertyTitle} numberOfLines={1}>
            {propertyTitle}
          </Text>
        </View>

        {/* Last Message Snippet */}
        <Text style={[styles.lastMessage, unreadCount > 0 && styles.unreadLastMessage]} numberOfLines={1}>
          {lastMessage}
        </Text>
      </View>

      {/* Right Side - Timestamp & Unread Badge */}
      <View style={styles.rightContent}>
        <Text style={[styles.timestamp, unreadCount > 0 && styles.timestampUnread]}>
          {formatTimestamp(timestamp)}
        </Text>

        {unreadCount > 0 ? (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </Text>
          </View>
        ) : (
          <Icon name="chevron-forward" size={14} color="#A0AEC0" style={{ marginTop: 6 }} />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 13,
    backgroundColor: colors.cardBg,
    borderRadius: 18,
    marginHorizontal: 16,
    marginVertical: 5,
    borderWidth: 1.5,
    borderTopColor: colors.borderHighlight,
    borderLeftColor: colors.borderHighlight,
    borderBottomColor: colors.borderShadow,
    borderRightColor: colors.borderShadow,
    elevation: 2,
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  unreadContainer: {
    backgroundColor: '#F7F6F2',
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  avatarPlaceholder: {
    backgroundColor: colors.greyLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  topContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  ownerName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    flexShrink: 1,
  },
  roleBadge: {
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
    marginLeft: 6,
  },
  roleText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.primaryDark,
    textTransform: 'uppercase',
  },
  propertyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  propertyTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primaryDark,
  },
  lastMessage: {
    fontSize: 12.5,
    color: colors.lightText,
    lineHeight: 17,
  },
  unreadLastMessage: {
    color: colors.text,
    fontWeight: '600',
  },
  rightContent: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginLeft: 8,
    minHeight: 44,
  },
  timestamp: {
    fontSize: 11,
    color: colors.lightText,
    fontWeight: '500',
  },
  timestampUnread: {
    color: colors.primaryDark,
    fontWeight: '700',
  },
  unreadBadge: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
    marginTop: 6,
    elevation: 2,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  unreadText: {
    color: '#1E293B',
    fontSize: 10,
    fontWeight: '800',
  },
});

export default ChatItem;
