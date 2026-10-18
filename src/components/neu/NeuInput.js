import React, { forwardRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { NEU_COLORS } from '../../constants/theme';

const NeuInput = forwardRef(({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  helperText,
  leftIcon = null,
  rightIcon = null,
  secureTextEntry = false,
  keyboardType = 'default',
  multiline = false,
  numberOfLines = 1,
  editable = true,
  maxLength,
  autoCapitalize = 'none',
  autoCorrect = false,
  containerStyle,
  inputStyle,
  onFocus,
  onBlur,
  onSubmitEditing,
  returnKeyType,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isSecureVisible, setIsSecureVisible] = useState(!secureTextEntry);

  const handleFocus = (e) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.insetContainer,
          isFocused && styles.insetContainerFocused,
          !!error && styles.insetContainerError,
          !editable && styles.insetContainerDisabled,
          multiline && styles.insetContainerMultiline,
        ]}
      >
        {leftIcon && <View style={styles.leftIconWrapper}>{leftIcon}</View>}

        <TextInput
          ref={ref}
          value={value ?? ''}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
          style={[
            styles.input,
            multiline && styles.inputMultiline,
            inputStyle,
          ]}
          secureTextEntry={secureTextEntry && !isSecureVisible}
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={numberOfLines}
          editable={editable}
          maxLength={maxLength}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onSubmitEditing={onSubmitEditing}
          returnKeyType={returnKeyType}
          {...props}
        />

        {secureTextEntry ? (
          <TouchableOpacity
            style={styles.rightIconWrapper}
            onPress={() => setIsSecureVisible(!isSecureVisible)}
            activeOpacity={0.7}
          >
            <Text style={styles.showHideText}>
              {isSecureVisible ? 'Hide' : 'Show'}
            </Text>
          </TouchableOpacity>
        ) : (
          rightIcon && (
            <View style={styles.rightIconWrapper}>{rightIcon}</View>
          )
        )}
      </View>

      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : helperText ? (
        <Text style={styles.helperText}>{helperText}</Text>
      ) : null}
    </View>
  );
});

NeuInput.displayName = 'NeuInput';

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  insetContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E5E3DC',
    borderRadius: 14,
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderBottomWidth: 1.5,
    borderRightWidth: 1.5,
    borderTopColor: '#D3D0C6',
    borderLeftColor: '#D3D0C6',
    borderBottomColor: '#FFFFFF',
    borderRightColor: '#FFFFFF',
    paddingHorizontal: 14,
    minHeight: 50,
  },
  insetContainerFocused: {
    borderColor: '#FDB022',
    backgroundColor: '#ECEAE3',
  },
  insetContainerError: {
    borderColor: '#EF4444',
  },
  insetContainerDisabled: {
    opacity: 0.6,
  },
  insetContainerMultiline: {
    alignItems: 'flex-start',
    paddingVertical: 10,
    minHeight: 80,
  },
  leftIconWrapper: {
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightIconWrapper: {
    marginLeft: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#2D3748',
    paddingVertical: 10,
    paddingHorizontal: 0,
  },
  inputMultiline: {
    textAlignVertical: 'top',
    minHeight: 60,
  },
  showHideText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FDB022',
  },
  errorText: {
    fontSize: 11,
    color: '#EF4444',
    marginTop: 4,
    marginLeft: 2,
    fontWeight: '500',
  },
  helperText: {
    fontSize: 11,
    color: '#626B78',
    marginTop: 4,
    marginLeft: 2,
  },
});

export default NeuInput;
