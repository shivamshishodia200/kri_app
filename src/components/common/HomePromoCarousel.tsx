import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { Icon, IconName } from './Icon';

export interface HomePromo {
  eyebrow: string;
  title: string;
  description: string;
  actionLabel: string;
  icon: IconName;
}

interface HomePromoCarouselProps {
  promos: HomePromo[];
  onAction: (index: number) => void;
}

export const HomePromoCarousel: React.FC<HomePromoCarouselProps> = ({ promos, onAction }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (promos.length < 2) return;
    const timer = setInterval(() => {
      setActiveIndex((index) => (index + 1) % promos.length);
    }, 6500);
    return () => clearInterval(timer);
  }, [promos.length]);

  if (promos.length === 0) return null;
  const promo = promos[activeIndex % promos.length];

  return (
    <View style={styles.container}>
      <View style={styles.copy}>
        <Text style={styles.eyebrow}>{promo.eyebrow}</Text>
        <Text style={styles.title}>{promo.title}</Text>
        <Text style={styles.description}>{promo.description}</Text>
        <TouchableOpacity style={styles.action} onPress={() => onAction(activeIndex)} accessibilityRole="button" accessibilityLabel={promo.actionLabel}>
          <Text style={styles.actionText}>{promo.actionLabel}</Text>
          <Icon name="arrow-right" size={15} color={colors.darkText} />
        </TouchableOpacity>
        <View style={styles.dots} accessibilityLabel={`Banner ${activeIndex + 1} of ${promos.length}`}>
          {promos.map((item, index) => (
            <TouchableOpacity
              key={`${item.eyebrow}-${index}`}
              onPress={() => setActiveIndex(index)}
              style={[styles.dot, index === activeIndex && styles.dotActive]}
              accessibilityRole="button"
              accessibilityLabel={`Show banner ${index + 1}`}
              accessibilityState={{ selected: index === activeIndex }}
            />
          ))}
        </View>
      </View>
      <View style={styles.iconCircle}><Icon name={promo.icon} size={42} color={colors.primary} /></View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { minHeight: 210, flexDirection: 'row', alignItems: 'center', overflow: 'hidden', backgroundColor: '#111C2D', borderRadius: 18, padding: spacing.lg, marginHorizontal: spacing.lg, borderWidth: 1, borderColor: '#2A394E' },
  copy: { flex: 1, paddingRight: spacing.sm },
  eyebrow: { ...typography.badge, color: colors.primary, fontSize: 10, fontWeight: '800' },
  title: { ...typography.h3, color: '#FFFFFF', fontSize: 19, marginTop: 6 },
  description: { ...typography.bodySmall, color: '#C2CCDA', lineHeight: 18, marginTop: 5 },
  action: { minHeight: 44, alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.primary, borderRadius: 9, paddingHorizontal: 12, marginTop: 12 },
  actionText: { ...typography.caption, color: colors.darkText, fontWeight: '800' },
  dots: { flexDirection: 'row', gap: 7, marginTop: 7 },
  dot: { width: 9, height: 9, borderRadius: 5, backgroundColor: '#68778B' },
  dotActive: { width: 22, backgroundColor: colors.primary },
  iconCircle: { width: 62, height: 62, borderRadius: 31, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(253, 176, 34, 0.12)', marginLeft: 2 },
});