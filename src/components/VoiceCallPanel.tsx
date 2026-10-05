import React, { useMemo } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BrandGradient } from './BrandGradient';
import { EndCallIcon, MicOffIcon, MicOnIcon, SpeakerIcon } from './icons/CallIcons';
import { useResponsive } from '../hooks/useResponsive';
import { initialsOf } from '../utils/requests';
import { colors, hairline, radius, spacing, typography } from '../theme';

const AVATAR_SIZE = 120;
/** The gradient ring sits this far outside the avatar. */
const RING_WIDTH = 4;
const CONTROL_SIZE = 64;
const END_SIZE = 72;

type VoiceCallPanelProps = {
  /** Who is on the other end. */
  peerName: string;
  /** One line under the name: Connecting… / Ringing… / Connected / Paused — … / Call ended, or the error. */
  status: string;
  /** The same running clock the header shows — "04:58 mins", or "02:10 left" on a package. */
  timer: string;
  /** "₹ 20/min" — the rate this session bills at. */
  rate?: string;
  /** A second, quieter line — the seeker's app going away, say. */
  note?: string;
  muted: boolean;
  speakerOn: boolean;
  onToggleMute: () => void;
  onToggleSpeaker: () => void;
  /** The red End control — opens the same confirmation the header's cross does. */
  onEnd: () => void;
  /** Set only while the call could not be set up: shows a Retry beside the status. */
  onRetry?: () => void;
  /** A past or finished call: the status alone, no controls to press. */
  ended?: boolean;
};

/**
 * The body of a `call` consultation, in place of the transcript and composer:
 * the seeker, how the call is going, the same clock the header runs, and the
 * three controls. Billing, pauses and packages are the screen's concern — this
 * only draws what it is told.
 */
export function VoiceCallPanel({
  peerName,
  status,
  timer,
  rate,
  note,
  muted,
  speakerOn,
  onToggleMute,
  onToggleSpeaker,
  onEnd,
  onRetry,
  ended = false,
}: VoiceCallPanelProps) {
  const insets = useSafeAreaInsets();
  const { px, contentWidth, isTablet } = useResponsive();
  const styles = useMemo(() => createStyles(px, contentWidth, isTablet), [px, contentWidth, isTablet]);

  return (
    <View style={styles.panel}>
      <View style={styles.identity}>
        <View style={styles.avatarRing}>
          <BrandGradient radius={px(AVATAR_SIZE + RING_WIDTH * 2) / 2} />
          <View style={styles.avatar}>
            <Text style={styles.initials}>{initialsOf(peerName)}</Text>
          </View>
        </View>

        <Text style={styles.name}>{peerName}</Text>
        <Text accessibilityRole="text" accessibilityLabel={`Call status: ${status}`} style={styles.status}>
          {status}
        </Text>
        {onRetry && !ended && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Retry call"
            onPress={onRetry}
            style={({ pressed }) => [styles.retry, pressed && styles.pressed]}
          >
            <Text style={styles.retryLabel}>Retry</Text>
          </Pressable>
        )}

        <Text style={styles.timer}>{timer}</Text>
        {rate ? <Text style={styles.rate}>{rate}</Text> : null}
        {note ? (
          <Text accessibilityRole="alert" style={styles.note}>
            {note}
          </Text>
        ) : null}
      </View>

      {!ended && (
        <View style={[styles.controls, { paddingBottom: insets.bottom + spacing.xl }]}>
          <View style={styles.control}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={muted ? 'Unmute' : 'Mute'}
              accessibilityState={{ selected: muted }}
              onPress={onToggleMute}
              style={({ pressed }) => [styles.round, !muted && styles.roundIdle, pressed && styles.pressed]}
            >
              {muted && <BrandGradient radius={px(CONTROL_SIZE) / 2} />}
              {muted ? <MicOffIcon size={px(26)} /> : <MicOnIcon size={px(26)} />}
            </Pressable>
            <Text style={styles.controlLabel}>{muted ? 'Unmute' : 'Mute'}</Text>
          </View>

          <View style={styles.control}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="End call"
              onPress={onEnd}
              style={({ pressed }) => [styles.round, styles.end, pressed && styles.pressed]}
            >
              <EndCallIcon size={px(30)} />
            </Pressable>
            <Text style={styles.controlLabel}>End</Text>
          </View>

          <View style={styles.control}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Speaker"
              accessibilityState={{ selected: speakerOn }}
              onPress={onToggleSpeaker}
              style={({ pressed }) => [styles.round, !speakerOn && styles.roundIdle, pressed && styles.pressed]}
            >
              {speakerOn && <BrandGradient radius={px(CONTROL_SIZE) / 2} />}
              <SpeakerIcon size={px(26)} color={speakerOn ? colors.text.inverse : colors.text.ink} />
            </Pressable>
            <Text style={styles.controlLabel}>Speaker</Text>
          </View>
        </View>
      )}
    </View>
  );
}

function createStyles(px: (value: number) => number, contentWidth: number, isTablet: boolean) {
  return StyleSheet.create({
    panel: {
      flex: 1,
      alignSelf: 'center',
      width: '100%',
      maxWidth: isTablet ? contentWidth : undefined,
      justifyContent: 'space-between',
      paddingHorizontal: spacing.xl,
    },
    identity: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
    },
    avatarRing: {
      width: px(AVATAR_SIZE + RING_WIDTH * 2),
      height: px(AVATAR_SIZE + RING_WIDTH * 2),
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.md,
    },
    avatar: {
      width: px(AVATAR_SIZE),
      height: px(AVATAR_SIZE),
      borderRadius: px(AVATAR_SIZE) / 2,
      backgroundColor: colors.brandYellow,
      alignItems: 'center',
      justifyContent: 'center',
      ...Platform.select({
        ios: {
          shadowColor: colors.brandYellow,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.5,
          shadowRadius: 20,
        },
        android: {
          shadowColor: colors.brandYellow,
          elevation: 12,
        },
        default: {},
      }),
    },
    initials: {
      ...typography.initialsLarge,
      fontSize: 36,
      lineHeight: 54,
      color: colors.text.ink,
    },
    name: {
      ...typography.headline,
      color: colors.text.ink,
      textAlign: 'center',
    },
    status: {
      ...typography.meta,
      color: colors.text.secondary,
      textAlign: 'center',
    },
    retry: {
      paddingHorizontal: spacing.section,
      paddingVertical: spacing.xs,
      borderRadius: radius.chip,
      borderWidth: 1,
      borderColor: colors.text.ink,
    },
    retryLabel: {
      ...typography.actionLabel,
      color: colors.text.ink,
    },
    timer: {
      ...typography.earningsAmount,
      color: colors.text.ink,
      marginTop: spacing.section,
    },
    rate: {
      ...typography.captionBody,
      color: colors.text.muted,
    },
    note: {
      ...typography.caption,
      color: colors.status.danger,
      textAlign: 'center',
      marginTop: spacing.sm,
    },
    controls: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'center',
      gap: spacing.xxxl,
      paddingTop: spacing.lg,
    },
    control: {
      alignItems: 'center',
      gap: spacing.sm,
    },
    round: {
      width: px(CONTROL_SIZE),
      height: px(CONTROL_SIZE),
      borderRadius: px(CONTROL_SIZE) / 2,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    roundIdle: {
      backgroundColor: colors.surface,
      borderWidth: hairline,
      borderColor: colors.border.hairline,
    },
    end: {
      width: px(END_SIZE),
      height: px(END_SIZE),
      borderRadius: px(END_SIZE) / 2,
      backgroundColor: colors.status.danger,
    },
    pressed: {
      opacity: 0.7,
    },
    controlLabel: {
      ...typography.tabLabel,
      color: colors.text.secondary,
    },
  });
}
