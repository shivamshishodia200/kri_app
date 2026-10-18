import React from 'react';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NEU_COLORS } from '../../constants/theme';

export default function NeuScreen({
  children,
  scrollable = false,
  header = null,
  footer = null,
  style,
  contentContainerStyle,
  keyboardAvoiding = true,
  safeAreaEdges = ['top', 'left', 'right'],
  showsVerticalScrollIndicator = false,
  refreshControl = null,
  ...props
}) {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const innerContent = (
    <View
      style={[
        styles.responsiveWrapper,
        isTablet && styles.tabletWrapper,
      ]}
    >
      {children}
    </View>
  );

  return (
    <SafeAreaView
      edges={safeAreaEdges}
      style={[styles.container, style]}
      {...props}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor={NEU_COLORS.background}
        translucent={false}
      />
      {header}

      {keyboardAvoiding ? (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardAvoid}
        >
          {scrollable ? (
            <ScrollView
              contentContainerStyle={[
                styles.scrollContent,
                contentContainerStyle,
              ]}
              showsVerticalScrollIndicator={showsVerticalScrollIndicator}
              keyboardShouldPersistTaps="handled"
              refreshControl={refreshControl}
            >
              {innerContent}
            </ScrollView>
          ) : (
            <View style={[styles.staticContent, contentContainerStyle]}>
              {innerContent}
            </View>
          )}
        </KeyboardAvoidingView>
      ) : scrollable ? (
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            contentContainerStyle,
          ]}
          showsVerticalScrollIndicator={showsVerticalScrollIndicator}
          keyboardShouldPersistTaps="handled"
          refreshControl={refreshControl}
        >
          {innerContent}
        </ScrollView>
      ) : (
        <View style={[styles.staticContent, contentContainerStyle]}>
          {innerContent}
        </View>
      )}

      {footer}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EFEEE9',
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
  },
  staticContent: {
    flex: 1,
    alignItems: 'center',
  },
  responsiveWrapper: {
    width: '100%',
    flex: 1,
  },
  tabletWrapper: {
    maxWidth: 680,
    alignSelf: 'center',
  },
});
