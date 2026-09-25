import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SunStarIcon } from '../components/icons/SunStarIcon';
import { OrDivider } from '../components/OrDivider';
import { PhoneField } from '../components/PhoneField';
import { requestLoginOtp } from '../services/auth';
import type { ApiError } from '../services/client';
import { PrimaryButton } from '../components/PrimaryButton';
import { SocialAuthButtons } from '../components/SocialAuthButtons';
import { colors, hairline, radius, spacing, typography } from '../theme';

const TILE_SIZE = 55.998;
const TILE_ICON_SIZE = 31.999;
const CTA_HEIGHT = 51.998;
/** A mobile number is complete at ten digits, which is what arms "Send OTP". */
const MOBILE_LENGTH = 10;

type LoginScreenProps = {
  /**
   * Called once a code has actually been sent, with the identifier it went to.
   * `devCode` is present only while there is no SMS or mail provider.
   */
  onSendOtp?: (mobile: string, devCode?: string) => void;
  /** No account behind that identifier — the screen offers registration. */
  onRegister?: () => void;
  onGoogle?: () => void;
  onApple?: () => void;
};

/**
 * Mobile-number login: a white header block over the form, with the CTA held
 * inert until the number is complete.
 * Figma: nodes 104:5434 (empty) and 104:5505 (filled).
 */
export function LoginScreen({
  onSendOtp,
  onRegister,
  onGoogle,
  onApple,
}: LoginScreenProps) {
  const insets = useSafeAreaInsets();
  const [mobile, setMobile] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /** True when the number has no account — the CTA turns into Register. */
  const [notRegistered, setNotRegistered] = useState(false);

  const isComplete = mobile.length === MOBILE_LENGTH;

  /**
   * Asks the server for a code.
   *
   * An unregistered number comes back as `account_not_found`, which is the cue
   * to send them to the application wizard rather than to an OTP screen.
   */
  const send = async () => {
    if (!isComplete || sending) {
      return;
    }

    setSending(true);
    setError(null);
    setNotRegistered(false);

    try {
      const sent = await requestLoginOtp({ channel: 'phone', phone: mobile });
      onSendOtp?.(mobile, sent.devCode);
    } catch (caught) {
      const failure = caught as ApiError;
      setNotRegistered(failure?.code === 'account_not_found');
      setError(failure?.message ?? 'Something went wrong. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" />

      {/* Figma pads the header 56pt from the frame top, 9pt of which sits
          below the status bar. */}
      <View style={[styles.header, { paddingTop: insets.top + 9 }]}>
        <View style={styles.tile}>
          <SunStarIcon size={TILE_ICON_SIZE} />
        </View>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Login with your mobile number</Text>
      </View>

      <KeyboardAvoidingView
        behavior="padding"
        style={styles.body}
      >
        <PhoneField
          label="Mobile Number"
          value={mobile}
          onChangeText={text => setMobile(text.replace(/\D/g, ''))}
          maxLength={MOBILE_LENGTH}
        />

        <View>
          <View style={styles.dividerWrap}>
            <OrDivider label="or login with" />
          </View>
          <SocialAuthButtons
            onGoogle={onGoogle}
            onApple={onApple}
          />
        </View>

        {/* Figma leaves the middle of the screen empty (node 104:5494). */}
        <View style={styles.spacer} />

        <View style={{ paddingBottom: spacing.lg + insets.bottom }}>
          {error !== null && <Text style={styles.error}>{error}</Text>}

          {notRegistered ? (
            <PrimaryButton
              label="Create an account"
              height={CTA_HEIGHT}
              labelStyle={typography.buttonStrong}
              onPress={onRegister}
            />
          ) : (
            <PrimaryButton
              label={sending ? 'Sending…' : 'Send OTP'}
              height={CTA_HEIGHT}
              disabled={!isComplete || sending}
              labelStyle={typography.buttonStrong}
              onPress={send}
            />
          )}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  error: {
    ...typography.caption,
    color: colors.status.danger,
    textAlign: 'center',
    paddingBottom: spacing.md,
  },
  screen: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  header: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.xl,
    paddingBottom: 24.755,
    borderBottomWidth: hairline,
    borderBottomColor: colors.border.hairline,
  },
  tile: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    borderRadius: radius.iconTile,
    backgroundColor: colors.brandYellow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...typography.pageTitle,
    color: colors.text.inkSoft,
    paddingTop: spacing.section,
  },
  subtitle: {
    ...typography.pageSubtitle,
    color: colors.text.secondary,
    paddingTop: spacing.xs,
  },
  body: {
    flex: 1,
    paddingTop: spacing.xxxl,
    paddingHorizontal: spacing.xl,
    gap: spacing.lg,
  },
  dividerWrap: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  spacer: {
    flex: 1,
  },
});
