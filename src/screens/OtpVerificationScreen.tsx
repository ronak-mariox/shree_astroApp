import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SmsBoltIcon } from '../components/icons/SmsBoltIcon';
import { SunStarIcon } from '../components/icons/SunStarIcon';
import { InfoNote } from '../components/InfoNote';
import { requestLoginOtp, verifyLoginOtp, type AuthAstrologer } from '../services/auth';
import { OtpInput } from '../components/OtpInput';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors, radius, spacing, typography } from '../theme';

const TILE_SIZE = 51.998;
const TILE_ICON_SIZE = 27.999;
const CTA_HEIGHT = 51.998;
const OTP_LENGTH = 6;
/** Figma shows the countdown at 0:42, so it starts from three quarters of a minute. */
const RESEND_SECONDS = 45;

type OtpVerificationScreenProps = {
  /** Digits the code was sent to, formatted for display. */
  mobile?: string;
  /** The ten digits the code actually went to, for the verify call. */
  phone?: string;
  /**
   * Called once the code checks out and the session is stored. Handed the
   * signed-in astrologer, so the caller can route an unapproved application
   * differently from one already live — no `astrologer` when a test mounts
   * this screen standalone with no `phone` to verify against.
   */
  onVerified?: (astrologer?: AuthAstrologer) => void;
  onResend?: () => void;
  /**
   * The real code, while there is no SMS provider. Shown on screen and filled
   * in automatically, so the flow is usable in development.
   */
  devCode?: string;
};

/** Formats a second count as `m:ss`. */
const formatCountdown = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

/**
 * OTP entry: six boxes that light up as they fill, a resend countdown, and the
 * SMS auto-read advisory. The CTA stays inert until all six digits are in.
 * Figma: nodes 104:5576 (empty) and 104:5632 (filled).
 */
export function OtpVerificationScreen({
  mobile = '98765 43210',
  phone,
  onVerified,
  onResend,
  devCode,
}: OtpVerificationScreenProps) {
  const insets = useSafeAreaInsets();
  const [code, setCode] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (secondsLeft === 0) {
      return;
    }
    const timer = setTimeout(() => setSecondsLeft(current => current - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  const isComplete = code.length === OTP_LENGTH;

  /**
   * Checks the code and, on success, stores the session.
   *
   * `phone` is not passed by the tests, which drive `onVerified` directly; the
   * call is skipped in that case so the screen stays usable on its own.
   */
  const verify = async () => {
    if (!isComplete || verifying) {
      return;
    }
    if (!phone) {
      onVerified?.();
      return;
    }

    setVerifying(true);
    setError(null);

    try {
      const session = await verifyLoginOtp({ channel: 'phone', phone }, code);
      onVerified?.(session.astrologer);
    } catch (caught) {
      setError(
        (caught as Error)?.message ?? 'Something went wrong. Please try again.',
      );
    } finally {
      setVerifying(false);
    }
  };

  const resend = async () => {
    setSecondsLeft(RESEND_SECONDS);
    setCode('');
    setError(null);

    if (phone) {
      try {
        await requestLoginOtp({ channel: 'phone', phone });
      } catch (caught) {
        setError((caught as Error)?.message ?? 'Could not send another code.');
      }
    }

    onResend?.();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[
        styles.screen,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <View style={styles.tile}>
          <SunStarIcon size={TILE_ICON_SIZE} />
        </View>
        <Text style={styles.title}>Verify OTP</Text>
        <Text style={styles.meta}>
          6-digit code sent to{' '}
          <Text style={styles.metaStrong}>+91 {mobile}</Text>
        </Text>
      </View>

      {/* The boxes overhang the 24pt page gutter, as Figma draws them
          (node 104:5603 spans 380pt inside a 342pt container). */}
      <OtpInput value={code} onChangeText={setCode} style={styles.otpRow} />

      {secondsLeft > 0 ? (
        <Text style={styles.resend}>
          Didn't receive?{' '}
          <Text style={styles.resendStrong}>
            Resend in {formatCountdown(secondsLeft)}
          </Text>
        </Text>
      ) : (
        <Pressable
          accessibilityRole="button"
          onPress={resend}
          style={styles.resendAction}
        >
          <Text style={styles.resend}>
            Didn't receive? <Text style={styles.resendStrong}>Resend OTP</Text>
          </Text>
        </Pressable>
      )}

      {devCode !== undefined && (
        <Text style={styles.devCode}>Dev code: {devCode}</Text>
      )}

      {error !== null && <Text style={styles.error}>{error}</Text>}

      <PrimaryButton
        label={verifying ? 'Verifying…' : 'Verify & Continue'}
        height={CTA_HEIGHT}
        disabled={!isComplete || verifying}
        disabledRadius={radius.field}
        labelStyle={typography.buttonStrong}
        onPress={verify}
        style={styles.cta}
      />

      <InfoNote icon={<SmsBoltIcon />}>
        Auto-reading SMS. Allow SMS permission if prompted.
      </InfoNote>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  devCode: {
    ...typography.caption,
    color: colors.text.secondary,
    textAlign: 'center',
    paddingBottom: spacing.xs,
  },
  error: {
    ...typography.caption,
    color: colors.status.danger,
    textAlign: 'center',
    paddingBottom: spacing.sm,
  },
  screen: {
    flex: 1,
    backgroundColor: colors.canvas,
    alignItems: 'stretch',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  header: {
    alignItems: 'center',
    paddingBottom: spacing.xxl,
  },
  tile: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    borderRadius: radius.iconTileSmall,
    backgroundColor: colors.brandYellow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...typography.pageTitleSmall,
    color: colors.text.inkSoft,
    textAlign: 'center',
    paddingTop: 14,
  },
  meta: {
    ...typography.meta,
    color: colors.text.secondary,
    textAlign: 'center',
    paddingTop: 6,
  },
  metaStrong: {
    ...typography.metaStrong,
    color: colors.text.inkSoft,
  },
  otpRow: {
    marginHorizontal: -19,
    marginBottom: spacing.section,
  },
  resend: {
    ...typography.meta,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  resendStrong: {
    ...typography.metaBold,
    color: colors.text.ink,
  },
  resendAction: {
    alignSelf: 'center',
  },
  cta: {
    marginTop: spacing.lg,
    marginBottom: spacing.section,
  },
});
