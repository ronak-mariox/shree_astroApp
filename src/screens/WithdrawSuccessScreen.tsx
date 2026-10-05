import React from 'react';
import { StatusBar, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CheckIcon } from '../components/icons/CheckIcon';
import { PrimaryButton } from '../components/PrimaryButton';
import { formatRupees } from '../data/wallet';
import { colors, spacing, stroke, typography } from '../theme';

const BADGE_SIZE = 95.996;
const BADGE_ICON_SIZE = 47.998;
const CTA_HEIGHT = 51.998;

type WithdrawSuccessScreenProps = {
  /** The amount that was requested, in plain digits. */
  amount: string;
  onBackToWallet?: () => void;
};

/**
 * The end of the withdrawal: confirmation and the way back.
 * Figma: node 112:1509.
 */
export function WithdrawSuccessScreen({
  amount,
  onBackToWallet,
}: WithdrawSuccessScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.screen,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <StatusBar barStyle="dark-content" />

      <View style={styles.badgeWrap}>
        <View style={styles.badge}>
          <CheckIcon size={BADGE_ICON_SIZE} />
        </View>
      </View>

      <Text style={styles.title}>Request{'\n'}submitted</Text>

      <Text style={styles.body}>
        Please wait up to 24 hours for admin approval. {formatRupees(amount)} will
        be credited to your bank account once approved — your wallet balance is
        deducted only then.
      </Text>

      <PrimaryButton
        label="Back to Wallet"
        height={CTA_HEIGHT}
        labelStyle={styles.ctaLabel}
        onPress={onBackToWallet}
        style={styles.cta}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.canvas,
    alignItems: 'stretch',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxxl,
  },
  badgeWrap: {
    alignItems: 'center',
    paddingBottom: spacing.xl,
  },
  badge: {
    width: BADGE_SIZE,
    height: BADGE_SIZE,
    borderRadius: BADGE_SIZE / 2,
    borderWidth: stroke,
    borderColor: colors.status.success,
    backgroundColor: colors.status.successTintStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...typography.headline,
    color: colors.text.inkSoft,
    textAlign: 'center',
  },
  body: {
    ...typography.subtitle,
    lineHeight: 22.4,
    color: colors.text.secondary,
    textAlign: 'center',
    paddingTop: 10,
  },
  cta: {
    marginTop: spacing.xxxl,
  },
  ctaLabel: {
    ...typography.buttonStrong,
    color: colors.text.onGradient,
  },
});
