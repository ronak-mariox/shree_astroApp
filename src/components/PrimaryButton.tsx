import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { colors, radius, typography } from '../theme';
import { BrandGradient } from './BrandGradient';

const BUTTON_HEIGHT = 49.992;

type PrimaryButtonProps = {
  label: string;
  onPress?: () => void;
  /** Drops the gradient for a flat grey fill and stops it responding. */
  disabled?: boolean;
  /** Figma runs the login CTAs 2pt taller than the onboarding ones. */
  height?: number;
  /** Corner radius while disabled — Figma softens it (16 on login, 14 on OTP). */
  disabledRadius?: number;
  /** Defaults to the 16pt semibold label; the onboarding footer uses 15pt bold. */
  labelStyle?: StyleProp<TextStyle>;
  /** `shallow` matches the onboarding footer's slightly flatter ramp. */
  gradientAngle?: 'diagonal' | 'shallow';
  style?: StyleProp<ViewStyle>;
};

/**
 * Filled CTA carrying the brand gradient — Figma paints it with
 * `linear-gradient(261.86deg, #F55102 0%, #FFBC01 100%)`, projected from the
 * top-right corner to the bottom-left (see {@link BrandGradient}). The disabled
 * variant swaps the gradient for a translucent black fill and a grey label
 * (Figma nodes 104:5495, 104:5613).
 */
export function PrimaryButton({
  label,
  onPress,
  disabled = false,
  height = BUTTON_HEIGHT,
  disabledRadius = radius.buttonDisabled,
  labelStyle,
  gradientAngle = 'diagonal',
  style,
}: PrimaryButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { height },
        disabled && [
          styles.buttonDisabled,
          { borderRadius: disabledRadius },
        ],
        pressed && !disabled && styles.pressed,
        style,
      ]}
    >
      {!disabled && <BrandGradient radius={radius.button} angle={gradientAngle} />}
      <Text
        style={[styles.label, disabled && styles.labelDisabled, labelStyle]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: radius.button,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  buttonDisabled: {
    backgroundColor: colors.surfaceDisabled,
  },
  pressed: {
    opacity: 0.9,
  },
  label: {
    ...typography.button,
    color: colors.text.inverse,
    textAlign: 'center',
  },
  labelDisabled: {
    color: colors.text.muted,
  },
});
