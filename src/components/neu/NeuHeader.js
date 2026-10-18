import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { NEU_COLORS } from '../../constants/theme';

export default function NeuHeader({
  title,
  subtitle,
  onBack,
  showBack = true,
  rightAction = null,
  rightIcon = null,
  onRightPress = null,
  style,
  titleStyle,
}) {
  return (
    <View style={[styles.headerContainer, style]}>
      <View style={styles.leftContainer}>
        {showBack && onBack ? (
          <TouchableOpacity
            onPress={onBack}
            style={styles.neuCircleButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            activeOpacity={0.7}
          >
            <Icon name="arrow-back" size={20} color="#2D3748" />
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>

      <View style={styles.titleContainer}>
        {title && (
          <Text style={[styles.title, titleStyle]} numberOfLines={1}>
            {title}
          </Text>
        )}
        {subtitle && (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        )}
      </View>

      <View style={styles.rightContainer}>
        {rightAction ? (
          rightAction
        ) : rightIcon && onRightPress ? (
          <TouchableOpacity
            onPress={onRightPress}
            style={styles.neuCircleButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            activeOpacity={0.7}
          >
            <Icon name={rightIcon} size={20} color="#2D3748" />
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#EFEEE9',
    borderBottomWidth: 1,
    borderBottomColor: '#E2DFD6',
  },
  leftContainer: {
    width: 44,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  rightContainer: {
    width: 44,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  placeholder: {
    width: 44,
  },
  neuCircleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFEEE9',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderBottomWidth: 1.5,
    borderRightWidth: 1.5,
    borderTopColor: '#FFFFFF',
    borderLeftColor: '#FFFFFF',
    borderBottomColor: '#D8D5CB',
    borderRightColor: '#D8D5CB',
    shadowColor: '#1E293B',
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#2D3748',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 11,
    color: '#626B78',
    textAlign: 'center',
    marginTop: 2,
  },
});
