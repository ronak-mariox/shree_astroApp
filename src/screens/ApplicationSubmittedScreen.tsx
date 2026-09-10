import React, { useState } from 'react';
import { StatusBar, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CheckIcon } from '../components/icons/CheckIcon';
import { PrimaryButton } from '../components/PrimaryButton';
import { ReviewTimeline } from '../components/ReviewTimeline';
import { REVIEW_STAGES } from '../data/registration';
import { fetchProfile } from '../services/api';
import { getSession, updateAstrologer } from '../services/session';
import { colors, spacing, stroke, typography } from '../theme';

const BADGE_SIZE = 87.997;
const BADGE_ICON_SIZE = 43.998;
const CTA_HEIGHT = 51.998;

type ApplicationSubmittedScreenProps = {
  /** Only ever fires once Check Status has actually found the application approved. */
  onGetStarted?: () => void;
};

/**
 * The end of registration: confirmation, what happens next, and the way to
 * find out whether it's approved yet. Figma: node 105:6683.
 *
 * This screen is only ever reached with an application that isn't approved
 * — App.tsx's own gate sends an approved astrologer straight to the
 * dashboard on sign-in — so "Check Status" is the one thing that can change
 * what's shown here: a real `applicationStatus` re-fetch that either flips
 * every stage to done and swaps the button for "Get Started", or says so and
 * leaves the astrologer here to try again later.
 */
export function ApplicationSubmittedScreen({
  onGetStarted,
}: ApplicationSubmittedScreenProps) {
  const insets = useSafeAreaInsets();
  const [approved, setApproved] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkStatus = async () => {
    setChecking(true);
    setError(null);

    try {
      const profile = await fetchProfile();
      const isApproved = profile.applicationStatus === 'approved';
      setApproved(isApproved);

      /** So the next restore-session routes straight to the dashboard from here on. */
      const session = getSession();
      if (isApproved && session) {
        await updateAstrologer({ ...session.astrologer, applicationStatus: 'approved' });
      }

      if (!isApproved) {
        setError("Still under review — check back again in a little while.");
      }
    } catch (caught) {
      setError(
        (caught as Error)?.message ?? 'Could not check your status. Please try again.',
      );
    } finally {
      setChecking(false);
    }
  };

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

      <Text style={styles.title}>
        {approved ? "You're Approved! 🎉" : 'Application Submitted!'}
      </Text>

      <Text style={styles.body}>
        {approved ? (
          "You're all set — start taking consultations whenever you're ready."
        ) : (
          <>
            We're reviewing your documents. You'll get a confirmation within{' '}
            <Text style={styles.bodyStrong}>24–48 hours</Text> on your registered
            number.
          </>
        )}
      </Text>

      <ReviewTimeline
        steps={REVIEW_STAGES}
        completed={approved ? REVIEW_STAGES.length : 1}
      />

      {error !== null && <Text style={styles.error}>{error}</Text>}

      <PrimaryButton
        label={approved ? 'Get Started →' : checking ? 'Checking…' : 'Check Status'}
        height={CTA_HEIGHT}
        disabled={checking}
        labelStyle={typography.buttonStrong}
        onPress={approved ? onGetStarted : checkStatus}
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
  error: {
    ...typography.caption,
    color: colors.status.danger,
    textAlign: 'center',
    paddingBottom: spacing.sm,
  },
  cta: {
    marginTop: spacing.xs,
  },
});
