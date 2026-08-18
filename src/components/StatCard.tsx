import React, { type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, hairline, radius, typography } from '../theme';

const WELL_SIZE = 35.999;

type StatCardProps = {
  icon: ReactNode;
  /** Tint behind the icon and, at a lighter mix, behind the badge. */
  wellColor: string;
  badgeColor: string;
  badgeLabelColor: string;
  badge: string;
  value: string;
  caption: string;
  /** Third line — the trend on earnings, the hint on the wallet. */
  footnote: string;
  footnoteColor: string;
  onPress?: () => void;
};

/**
 * One of the two headline cards at the top of the dashboard
 * (Figma nodes 104:5766 earnings, 104:5787 wallet).
 */
export function StatCard({
  icon,
  wellColor,
  badgeColor,
  badgeLabelColor,
  badge,
  value,
  caption,
  footnote,
  footnoteColor,
  onPress,
}: StatCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.top}>
        <View style={[styles.well, { backgroundColor: wellColor }]}>{icon}</View>
        <View style={[styles.badge, { backgroundColor: badgeColor }]}>
          <Text style={[styles.badgeLabel, { color: badgeLabelColor }]}>
            {badge}
          </Text>
        </View>
      </View>

      <Text style={styles.value}>{value}</Text>
      <Text style={styles.caption}>{caption}</Text>
      <Text style={[styles.footnote, { color: footnoteColor }]}>{footnote}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    padding: 16.755,
    justifyContent: 'center',
    borderRadius: radius.card,
    borderWidth: hairline,
    borderColor: colors.border.hairline,
    backgroundColor: colors.surface,
  },
  pressed: {
    opacity: 0.8,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  well: {
    width: WELL_SIZE,
    height: WELL_SIZE,
    borderRadius: radius.well,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.chipSmall,
  },
  badgeLabel: {
    ...typography.badgeLabel,
  },
  value: {
    ...typography.dashboardTitle,
    color: colors.text.inkSoft,
    paddingTop: 12,
  },
  caption: {
    ...typography.cardCaption,
    color: colors.text.secondary,
    paddingTop: 2,
  },
  footnote: {
    ...typography.cardCaption,
    paddingTop: 3,
  },
});
