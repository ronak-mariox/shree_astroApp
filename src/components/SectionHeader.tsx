import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '../theme';

type SectionHeaderProps = {
  title: string;
  /** The red count pill, e.g. "3 New". Omitted when there is nothing to flag. */
  badge?: string;
};

/**
 * A section title with an optional red count beside it — used by the dashboard's
 * pending requests and both lists on the consult screen
 * (Figma nodes 104:5903, 112:2058, 112:2154).
 */
export function SectionHeader({ title, badge }: SectionHeaderProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.title}>{title}</Text>
      {badge !== undefined && (
        <View style={styles.badge}>
          <Text style={styles.badgeLabel}>{badge}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    ...typography.sectionTitle,
    color: colors.text.inkSoft,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.note,
    backgroundColor: colors.status.danger,
  },
  badgeLabel: {
    ...typography.badgeLabelStrong,
    color: colors.text.inverse,
  },
});
