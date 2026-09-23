import React from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { colors } from '../../theme/colors';
import { radii, spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { shadows } from '../../theme/shadows';
import { Icon } from './Icon';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onClear?: () => void;
  onFilterPress?: () => void;
  placeholder?: string;
  style?: ViewStyle;
  editable?: boolean;
  onPress?: () => void;
  showFilterButton?: boolean;
  hasActiveFilters?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  onClear,
  onFilterPress,
  placeholder = 'Search by locality, project or BHK...',
  style,
  editable = true,
  onPress,
  showFilterButton = true,
  hasActiveFilters = false,
}) => {
  const content = (
    <View style={[styles.container, style]}>
      <View style={styles.iconLeft}>
        <Icon name="search" size={20} color={colors.textSecondary} />
      </View>

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        style={styles.input}
        editable={editable}
        pointerEvents={editable ? 'auto' : 'none'}
      />

      {value.length > 0 && onClear && (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onClear}
          style={styles.clearButton}
        >
          <Icon name="close" size={16} color={colors.textSecondary} />
        </TouchableOpacity>
      )}

      {showFilterButton && onFilterPress && (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onFilterPress}
          style={[
            styles.filterButton,
            hasActiveFilters && styles.filterButtonActive,
          ]}
        >
          <Icon
            name="sliders"
            size={18}
            color={hasActiveFilters ? colors.darkText : colors.textPrimary}
          />
          {hasActiveFilters && <View style={styles.activeDot} />}
        </TouchableOpacity>
      )}
    </View>
  );

  if (!editable && onPress) {
    return (
      <TouchableOpacity activeOpacity={0.85} onPress={onPress}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 48,
    ...shadows.sm,
  },
  iconLeft: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    ...typography.bodyMedium,
    fontSize: 14,
    color: colors.darkText,
    paddingVertical: spacing.xs,
  },
  clearButton: {
    padding: spacing.xs,
    marginRight: spacing.xs,
  },
  filterButton: {
    padding: spacing.xs + 3,
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    position: 'relative',
    marginLeft: spacing.xs,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryDark,
  },
  activeDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.danger,
    position: 'absolute',
    top: 2,
    right: 2,
  },
});
