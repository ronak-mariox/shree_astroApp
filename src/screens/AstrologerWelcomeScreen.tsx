import React from 'react';
import { Platform, StatusBar, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FeatureChip } from '../components/FeatureChip';
import { SunStarIcon } from '../components/icons/SunStarIcon';
import { PrimaryButton } from '../components/PrimaryButton';
import { SecondaryButton } from '../components/SecondaryButton';
import { WELCOME_FEATURES } from '../data/onboarding';
import { colors, radius, spacing, typography } from '../theme';

type AstrologerWelcomeScreenProps = {
  onLogin?: () => void;
  onRegister?: () => void;
};

const BADGE_SIZE = 111.996;
const BADGE_ICON_SIZE = 59.998;

/**
 * The account gate at the end of onboarding: brand badge, the platform's
 * headline features, and the two ways an astrologer gets in.
 * Figma: node 104:5296.
 */
export function AstrologerWelcomeScreen({
  onLogin,
  onRegister,
}: AstrologerWelcomeScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.content}>
        <View style={styles.badgeWrap}>
          <View style={styles.badge}>
            <SunStarIcon size={BADGE_ICON_SIZE} />
          </View>
        </View>

        <Text style={styles.title}>Welcome to Shree Astro</Text>

        <Text style={styles.subtitle}>
          Your premium platform for Vedic astrology consultations
        </Text>

        <View style={styles.features}>
          {WELCOME_FEATURES.map(feature => (
            <FeatureChip key={feature} label={feature} />
          ))}
        </View>
      </View>

      <View
        style={[styles.footer, { paddingBottom: spacing.huge + insets.bottom }]}
      >
        <PrimaryButton
          label="Login to Your Account"
          labelStyle={typography.buttonStrong}
          onPress={onLogin}
        />
        <SecondaryButton
          label="Register as Astrologer"
          variant="brand"
          onPress={onRegister}
        />
        <Text style={styles.legal}>
          By continuing, you agree to our Terms &amp; Privacy Policy
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxxl,
  },
  badgeWrap: {
    paddingBottom: spacing.xl,
  },
  badge: {
    width: BADGE_SIZE,
    height: BADGE_SIZE,
    borderRadius: radius.badge,
    backgroundColor: colors.brandYellow,
    alignItems: 'center',
    justifyContent: 'center',
    // drop-shadow(0 0 20px rgba(240, 223, 32, 0.4))
    ...Platform.select({
      ios: {
        shadowColor: colors.brandYellow,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 20,
      },
      android: {
        shadowColor: colors.brandYellow,
        elevation: 12,
      },
      default: {},
    }),
  },
  // Figma sets both to 326pt so they break where the design does; a cap rather
  // than a fixed width keeps them inside narrower screens.
  title: {
    ...typography.display,
    color: colors.text.ink,
    textAlign: 'center',
    maxWidth: 326,
  },
  subtitle: {
    ...typography.subtitle,
    color: colors.text.ink,
    opacity: 0.5,
    textAlign: 'center',
    maxWidth: 326,
    paddingTop: 10,
  },
  // Three chips fit the first row and "Kundli" centres itself under them,
  // exactly as Figma lays them out (node 104:5401).
  features: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingTop: spacing.xxxl,
  },
  footer: {
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  legal: {
    ...typography.captionBody,
    // Figma sets this line to rgba(255, 255, 255, 0.3) — barely legible on the
    // light canvas, but kept as designed.
    color: colors.text.onCanvasGhost,
    textAlign: 'center',
    paddingTop: spacing.xs,
  },
});
