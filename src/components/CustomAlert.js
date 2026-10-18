import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');

const CustomAlert = ({
  visible,
  title,
  message,
  buttons = [],
  onDismiss,
  onClose,
  icon = 'alert-circle',
  iconColor = '#FDB022',
}) => {
  const handleDismiss = onDismiss || onClose;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={handleDismiss}
    >
      <View style={styles.overlay}>
        <View style={styles.alertContainer}>
          {/* Icon */}
          <View style={[styles.iconContainer, { backgroundColor: iconColor + '20' }]}>
            <Icon name={icon} size={48} color={iconColor} />
          </View>

          {/* Title */}
          <Text style={styles.title}>{title}</Text>

          {/* Message */}
          <Text style={styles.message}>{message}</Text>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            {buttons.map((button, index) => {
              if (button.style === 'cancel') {
                return (
                  <TouchableOpacity
                    key={index}
                    style={styles.cancelButton}
                    onPress={() => {
                      if (button.onPress) button.onPress();
                      if (handleDismiss) handleDismiss();
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.cancelButtonText}>{button.text}</Text>
                  </TouchableOpacity>
                );
              }
              
              return (
                <LinearGradient
                  key={index}
                  colors={['#FDB022', '#F39C12']}
                  style={styles.primaryButton}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <TouchableOpacity
                    style={styles.buttonInner}
                    onPress={() => {
                      if (button.onPress) button.onPress();
                      if (handleDismiss) handleDismiss();
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.primaryButtonText}>{button.text}</Text>
                  </TouchableOpacity>
                </LinearGradient>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  alertContainer: {
    width: width - 60,
    backgroundColor: '#EFEEE9',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderBottomWidth: 1.5,
    borderRightWidth: 1.5,
    borderTopColor: '#FFFFFF',
    borderLeftColor: '#FFFFFF',
    borderBottomColor: '#D8D5CB',
    borderRightColor: '#D8D5CB',
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  iconContainer: {
    width: 76,
    height: 76,
    borderRadius: 38,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 10,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  message: {
    fontSize: 14,
    color: '#626B78',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 22,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    width: '100%',
    borderRadius: 14,
    overflow: 'hidden',
  },
  buttonInner: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#1E293B',
    fontSize: 16,
    fontWeight: '700',
  },
  cancelButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#E5E3DC',
    alignItems: 'center',
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderTopColor: '#D3D0C6',
    borderLeftColor: '#D3D0C6',
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderBottomColor: '#FFFFFF',
    borderRightColor: '#FFFFFF',
  },
  cancelButtonText: {
    color: '#626B78',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default CustomAlert;
