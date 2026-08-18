import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SunStarIcon } from '../components/icons/SunStarIcon';
import { OrDivider } from '../components/OrDivider';
import { PhoneField } from '../components/PhoneField';
import { PrimaryButton } from '../components/PrimaryButton';
import { SocialAuthButtons } from '../components/SocialAuthButtons';
import { colors, hairline, radius, spacing, typography } from '../theme';

const TILE_SIZE = 55.998;
const TILE_ICON_SIZE = 31.999;
const CTA_HEIGHT = 51.998;
/** A mobile number is complete at ten digits, which is what arms "Send OTP". */
const MOBILE_LENGTH = 10;

type LoginScreenProps = {
  /** Called with the entered number once "Send OTP" is tapped. */
  onSendOtp?: (mobile: string) => void;
  onGoogle?: () => void;
  onFacebook?: () => void;
  onApple?: () => void;
};

/**
 * Mobile-number login: a white header block over the form, with the CTA held
 * inert until the number is complete.
 * Figma: nodes 104:5434 (empty) and 104:5505 (filled).
 */
export function LoginScreen({
  onSendOtp,
  onGoogle,
  onFacebook,
  onApple,
}: LoginScreenProps) {
  const insets = useSafeAreaInsets();
  const [mobile, setMobile] = useState('');

  const isComplete = mobile.length === MOBILE_LENGTH;

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
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
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
            onFacebook={onFacebook}
            onApple={onApple}
          />
        </View>

        {/* Figma leaves the middle of the screen empty (node 104:5494). */}
        <View style={styles.spacer} />

        <View style={{ paddingBottom: spacing.lg + insets.bottom }}>
          <PrimaryButton
            label="Send OTP"
            height={CTA_HEIGHT}
            disabled={!isComplete}
            labelStyle={typography.buttonStrong}
            onPress={() => onSendOtp?.(mobile)}
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
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
