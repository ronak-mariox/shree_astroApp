import React from 'react';
import { StatusBar, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CheckIcon } from '../components/icons/CheckIcon';
import { PrimaryButton } from '../components/PrimaryButton';
import { ReviewTimeline } from '../components/ReviewTimeline';
import { REVIEW_STAGES } from '../data/registration';
import { colors, spacing, stroke, typography } from '../theme';

const BADGE_SIZE = 87.997;
const BADGE_ICON_SIZE = 43.998;
const CTA_HEIGHT = 51.998;

type ApplicationSubmittedScreenProps = {
  onBackToHome?: () => void;
};

/**
 * The end of registration: confirmation, what happens next, and the way out.
 * Figma: node 105:6683.
 */
export function ApplicationSubmittedScreen({
  onBackToHome,
}: ApplicationSubmittedScreenProps) {
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

      <Text style={styles.title}>Application Submitted!</Text>

      <Text style={styles.body}>
        We're reviewing your documents. You'll get a confirmation within{' '}
        <Text style={styles.bodyStrong}>24–48 hours</Text> on your registered
        number.
      </Text>

      <ReviewTimeline steps={REVIEW_STAGES} completed={1} />

      <PrimaryButton
        label="Back to Home"
        height={CTA_HEIGHT}
        labelStyle={typography.buttonStrong}
        onPress={onBackToHome}
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
    paddingHorizontal: spacing.xxl,
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
    ...typography.successBody,
    color: colors.text.secondary,
    textAlign: 'center',
    paddingTop: 10,
    paddingBottom: spacing.xxl,
  },
  bodyStrong: {
    ...typography.successBodyStrong,
    color: colors.text.secondary,
  },
  cta: {
    marginTop: spacing.xs,
  },
});
