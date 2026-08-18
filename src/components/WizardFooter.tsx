import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, hairline, radius, spacing, typography } from '../theme';
import { PrimaryButton } from './PrimaryButton';

const CTA_HEIGHT = 51.998;

type WizardFooterProps = {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  /** Omitted on the first step, which has nothing behind it in the wizard. */
  onBack?: () => void;
  backLabel?: string;
};

/**
 * The wizard's white footer: the step's CTA over an optional text back link
 * (Figma nodes 105:6080 without the link, 105:6287 with it).
 */
export function WizardFooter({
  label,
  onPress,
  disabled = false,
  onBack,
  backLabel = '← Back',
}: WizardFooterProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.footer, { paddingBottom: 28.75 + insets.bottom }]}>
      <PrimaryButton
        label={label}
        height={CTA_HEIGHT}
        disabled={disabled}
        disabledRadius={radius.field}
        labelStyle={typography.buttonStrong}
        onPress={onPress}
      />

      {onBack && (
        <Pressable
          accessibilityRole="button"
          onPress={onBack}
          style={({ pressed }) => [styles.back, pressed && styles.pressed]}
        >
          <Text style={styles.backLabel}>{backLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    backgroundColor: colors.surface,
    borderTopWidth: hairline,
    borderTopColor: colors.border.hairline,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  back: {
    height: 39.999,
    marginTop: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.6,
  },
  backLabel: {
    ...typography.pageSubtitle,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});
