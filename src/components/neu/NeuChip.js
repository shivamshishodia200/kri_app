import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';

export default function NeuChip({
  label,
  selected = false,
  onPress,
  icon = null,
  count = null,
  style,
  textStyle,
  size = 'md', // 'sm' | 'md'
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      style={[
        styles.base,
        size === 'sm' ? styles.sizeSm : styles.sizeMd,
        selected ? styles.selectedContainer : styles.unselectedContainer,
        style,
      ]}
    >
      {icon && <View style={styles.iconWrapper}>{icon}</View>}
      <Text
        style={[
          styles.text,
          size === 'sm' ? styles.textSm : styles.textMd,
          selected ? styles.selectedText : styles.unselectedText,
          textStyle,
        ]}
      >
        {label}
      </Text>
      {count !== null && (
        <View
          style={[
            styles.countBadge,
            selected ? styles.countBadgeSelected : styles.countBadgeUnselected,
          ]}
        >
          <Text
            style={[
              styles.countText,
              selected ? styles.countTextSelected : styles.countTextUnselected,
            ]}
          >
            {count}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  sizeSm: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    minHeight: 34,
  },
  sizeMd: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    minHeight: 40,
  },
  unselectedContainer: {
    backgroundColor: '#EFEEE9',
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
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  selectedContainer: {
    backgroundColor: '#FFF8EB',
    borderWidth: 1.5,
    borderColor: '#FDB022',
    shadowColor: '#FDB022',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  text: {
    fontWeight: '600',
  },
  textSm: {
    fontSize: 12,
  },
  textMd: {
    fontSize: 13,
  },
  unselectedText: {
    color: '#626B78',
  },
  selectedText: {
    color: '#D97706',
    fontWeight: '700',
  },
  iconWrapper: {
    marginRight: 6,
  },
  countBadge: {
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
    marginLeft: 6,
  },
  countBadgeUnselected: {
    backgroundColor: '#E2DFD6',
  },
  countBadgeSelected: {
    backgroundColor: '#FDB022',
  },
  countText: {
    fontSize: 11,
    fontWeight: '700',
  },
  countTextUnselected: {
    color: '#626B78',
  },
  countTextSelected: {
    color: '#FFFFFF',
  },
});
