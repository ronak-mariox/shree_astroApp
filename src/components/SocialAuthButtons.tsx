import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, hairline, radius, spacing, typography } from '../theme';
import { AppleIcon } from './icons/AppleIcon';

const BUTTON_HEIGHT = 49.992;
const APPLE_ICON_SIZE = 19.999;

type SocialAuthButtonsProps = {
  onGoogle?: () => void;
  onFacebook?: () => void;
  onApple?: () => void;
};

/**
 * The three social sign-in buttons. Figma draws Google and Facebook as their
 * bare letterforms and Apple as an exported vector
 * (Figma nodes 104:5481, 104:5485, 104:5489).
 */
export function SocialAuthButtons({
  onGoogle,
  onApple,
}: SocialAuthButtonsProps) {
  return (
    <View style={styles.row}>
      <SocialButton label="Continue with Google" onPress={onGoogle}>
        <Text style={[styles.glyph, styles.google]}>G</Text>
      </SocialButton>

    
      <SocialButton label="Continue with Apple" onPress={onApple}>
        <AppleIcon size={APPLE_ICON_SIZE} />
      </SocialButton>
    </View>
  );
}

function SocialButton({
  label,
  onPress,
  children,
}: {
  label: string;
  onPress?: () => void;
  children: React.ReactNode;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  button: {
    flex: 1,
    height: BUTTON_HEIGHT,
    borderRadius: radius.field,
    borderWidth: hairline,
    borderColor: colors.border.hairline,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.6,
  },
  glyph: {
    ...typography.socialGlyph,
    textAlign: 'center',
  },
  google: {
    color: colors.social.google,
  },
  facebook: {
    color: colors.social.facebook,
  },
});
