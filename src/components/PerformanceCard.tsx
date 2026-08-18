import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  ChatBubbleIcon,
  StarOutlineIcon,
} from './icons/DashboardIcons';
import { CheckIcon } from './icons/CheckIcon';
import { colors, hairline, radius, spacing, typography } from '../theme';

const WELL_SIZE = 39.999;
const ICON_SIZE = 17.993;

export type PerformanceStats = {
  consultations: number;
  rating: number;
  acceptance: number;
};

type PerformanceCardProps = {
  stats: PerformanceStats;
  onViewAll?: () => void;
};

/**
 * Today's three headline numbers (Figma node 104:5809).
 */
export function PerformanceCard({ stats, onViewAll }: PerformanceCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Today's Performance</Text>
        <Pressable
          accessibilityRole="button"
          onPress={onViewAll}
          style={({ pressed }) => pressed && styles.pressed}
        >
          <Text style={styles.action}>View All</Text>
        </Pressable>
      </View>

      <View style={styles.stats}>
        <Stat
          well={colors.status.infoWell}
          icon={<ChatBubbleIcon size={ICON_SIZE} />}
          value={String(stats.consultations)}
          caption="Consultations"
        />
        <Stat
          well={colors.status.warningWell}
          icon={<StarOutlineIcon size={ICON_SIZE} />}
          value={stats.rating.toFixed(1)}
          caption="Rating"
        />
        <Stat
          well={colors.status.successWell}
          icon={<CheckIcon size={ICON_SIZE} />}
          value={`${stats.acceptance}%`}
          caption="Acceptance"
        />
      </View>
    </View>
  );
}

function Stat({
  well,
  icon,
  value,
  caption,
}: {
  well: string;
  icon: React.ReactNode;
  value: string;
  caption: string;
}) {
  return (
    <View style={styles.stat}>
      <View style={[styles.well, { backgroundColor: well }]}>{icon}</View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.caption}>{caption}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 18.755,
    borderRadius: radius.card,
    borderWidth: hairline,
    borderColor: colors.border.hairline,
    backgroundColor: colors.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    ...typography.sectionTitle,
    color: colors.text.inkSoft,
  },
  action: {
    ...typography.actionLabel,
    color: colors.text.ink,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.6,
  },
  stats: {
    flexDirection: 'row',
    gap: spacing.section,
    paddingTop: spacing.section,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  well: {
    width: WELL_SIZE,
    height: WELL_SIZE,
    borderRadius: radius.input,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  value: {
    ...typography.statValue,
    color: colors.text.inkSoft,
  },
  caption: {
    ...typography.statCaption,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});
