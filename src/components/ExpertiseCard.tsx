import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '../theme';

const HEADER_HEIGHT = 33;
const CHIP_HEIGHT = 36;

type ExpertiseCardProps = {
  title: string;
  items: ReadonlyArray<string>;
  onEdit?: () => void;
  actionLabel?: string;
};

/**
 * A read-only list of the astrologer's declared expertise, three chips to a row,
 * with a link to change it (Figma nodes 106:7011 life aspects, 106:7130 skills).
 */
export function ExpertiseCard({
  title,
  items,
  onEdit,
  actionLabel = 'Add/Update',
}: ExpertiseCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        {/* The strip sits at 70% in Figma; the row above it stays opaque. */}
        <View style={styles.headerTint} pointerEvents="none" />
        <Text style={styles.title}>{title}</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${actionLabel} ${title}`}
          onPress={onEdit}
          style={({ pressed }) => [styles.action, pressed && styles.pressed]}
        >
          <Text style={styles.actionLabel}>{actionLabel}</Text>
        </Pressable>
      </View>

      <View style={styles.chips}>
        {items.map(item => (
          <View key={item} style={styles.chip}>
            {/* Figma fades the chip's fill and outline to 30%, not its label. */}
            <View style={styles.chipFill} pointerEvents="none" />
            <Text style={styles.chipLabel}>{item}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.panel,
    borderWidth: 1.155,
    borderColor: colors.border.slate,
    backgroundColor: colors.surfaceGlass,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: HEADER_HEIGHT,
    paddingLeft: 7.7,
    paddingRight: 9,
  },
  headerTint: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: colors.surfaceHeader,
    opacity: 0.7,
  },
  title: {
    ...typography.panelTitle,
    color: colors.text.slate,
  },
  action: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.linkChip,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  pressed: {
    opacity: 0.6,
  },
  actionLabel: {
    ...typography.panelTitle,
    color: colors.text.slateMuted,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
    paddingHorizontal: 8.7,
    paddingTop: spacing.sm,
    paddingBottom: 13,
  },
  // 30% of the container's width plus the gaps means three fit a row and a
  // fourth wraps, which is how Figma lays them out.
  chip: {
    flexGrow: 1,
    flexBasis: '30%',
    height: CHIP_HEIGHT,
    borderRadius: radius.panel,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  chipFill: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    borderRadius: radius.panel,
    borderWidth: 1.155,
    borderColor: colors.border.slate,
    backgroundColor: colors.surfaceGlass,
    opacity: 0.3,
  },
  chipLabel: {
    ...typography.expertiseLabel,
    color: colors.text.ink,
    textAlign: 'center',
  },
});
