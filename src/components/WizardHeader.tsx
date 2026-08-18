import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, hairline, radius, spacing, typography } from '../theme';
import { BackChevronIcon } from './icons/BackChevronIcon';

const CHEVRON_SIZE = 21.993;

type WizardHeaderProps = {
  /** One-based index of the step on screen. */
  step: number;
  totalSteps: number;
  title: string;
  onBack?: () => void;
};

/**
 * The registration wizard's white header: a back chevron, "Step N of M", the
 * step title, and a progress bar that fills a quarter per step
 * (Figma nodes 105:6020, 105:6033).
 */
export function WizardHeader({
  step,
  totalSteps,
  title,
  onBack,
}: WizardHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    // Figma pads the header 48pt from the frame top, 1pt of which clears the
    // status bar.
    <View style={[styles.header, { paddingTop: insets.top + 1 }]}>
      <View style={styles.titleRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={onBack}
          hitSlop={spacing.sm}
          style={({ pressed }) => pressed && styles.pressed}
        >
          <BackChevronIcon size={CHEVRON_SIZE} />
        </Pressable>

        <View style={styles.titleColumn}>
          <Text style={styles.eyebrow}>
            Step {step} of {totalSteps}
          </Text>
          <Text style={styles.title}>{title}</Text>
        </View>
      </View>

      <View style={styles.track}>
        <View style={[styles.fill, { width: `${(step / totalSteps) * 100}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingBottom: 16.755,
    borderBottomWidth: hairline,
    borderBottomColor: colors.border.hairline,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  titleColumn: {
    flex: 1,
  },
  pressed: {
    opacity: 0.6,
  },
  eyebrow: {
    ...typography.formLabel,
    color: colors.text.secondary,
    textTransform: 'uppercase',
  },
  title: {
    ...typography.wizardTitle,
    color: colors.text.inkSoft,
    paddingTop: 2,
  },
  track: {
    marginTop: 14,
    height: 4,
    borderRadius: radius.progressBar,
    backgroundColor: colors.surfaceInset,
    overflow: 'hidden',
  },
  fill: {
    height: 4,
    borderRadius: radius.progressBar,
    backgroundColor: colors.brandYellow,
  },
});
