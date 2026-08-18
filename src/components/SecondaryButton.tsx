import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { colors, hairline, radius, typography } from '../theme';

const BUTTON_HEIGHT = 49.992;

type SecondaryButtonProps = {
  label: string;
  onPress?: () => void;
  /**
   * The cosmic welcome screen outlines this button in black (node 205:5951);
   * the astrologer screens outline it in translucent brand yellow and set the
   * label in `#111` (nodes 104:4997, 104:5421).
   */
  variant?: 'ink' | 'brand';
  /** Defaults to the 16pt label; the onboarding footer passes 15pt. */
  labelStyle?: StyleProp<TextStyle>;
  style?: StyleProp<ViewStyle>;
};

/** Hairline-outlined CTA used for the lower-emphasis action. */
export function SecondaryButton({
  label,
  onPress,
  variant = 'ink',
  labelStyle,
  style,
}: SecondaryButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        variant === 'brand' && styles.buttonBrand,
        pressed && styles.pressed,
        style,
      ]}
    >
      <Text
        style={[
          styles.label,
          variant === 'brand' && styles.labelBrand,
          labelStyle,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: BUTTON_HEIGHT,
    borderRadius: radius.buttonOutline,
    borderWidth: hairline,
    borderColor: colors.border.strong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonBrand: {
    borderColor: colors.border.brandSoft,
  },
  pressed: {
    opacity: 0.6,
  },
  label: {
    ...typography.button,
    color: colors.border.strong,
    textAlign: 'center',
  },
  labelBrand: {
    color: colors.text.ink,
  },
});
