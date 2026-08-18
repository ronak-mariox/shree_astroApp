import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '../theme';

type OrDividerProps = {
  label: string;
};

/** Hairline rules either side of a caption (Figma node 104:5474). */
export function OrDivider({ label }: OrDividerProps) {
  return (
    <View style={styles.row}>
      <View style={styles.rule} />
      <Text style={styles.label}>{label}</Text>
      <View style={styles.rule} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  rule: {
    flex: 1,
    height: 0.991,
    backgroundColor: colors.border.hairline,
  },
  label: {
    ...typography.dividerLabel,
    color: colors.text.muted,
  },
});
