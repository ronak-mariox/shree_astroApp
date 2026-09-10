import React, { useMemo } from 'react';
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BrandGradient } from './BrandGradient';
import { SendIcon } from './icons/ChatIcons';
import { useResponsive } from '../hooks/useResponsive';
import { colors, radius, spacing, typography } from '../theme';

const FIELD_HEIGHT = 63;
const SEND_SIZE = 52;
const ICON_SIZE = 20;
/** The composer bar is 83pt tall on the 375pt frame (Figma node 110:504). */
const BAR_HEIGHT = 83;

type ChatComposerProps = {
  value: string;
  onChangeText: (value: string) => void;
  onSend: () => void;
  /** True while the session's billing is paused (the seeker's balance ran out) — there's nothing to say to someone who can't hear it. */
  disabled?: boolean;
};

/**
 * The message composer: the field and the gradient send button beside it
 * (Figma nodes 110:504 – 110:518) — no attach, voice note, or emoji controls,
 * none of which the astrologer's side of a consultation uses.
 */
export function ChatComposer({
  value,
  onChangeText,
  onSend,
  disabled = false,
}: ChatComposerProps) {
  const insets = useSafeAreaInsets();
  const { contentWidth, isTablet } = useResponsive();
  const styles = useMemo(() => createStyles(contentWidth, isTablet), [contentWidth, isTablet]);

  return (
    <View
      style={[
        styles.bar,
        { height: BAR_HEIGHT + insets.bottom, paddingBottom: insets.bottom },
      ]}
    >
      <View style={styles.field}>
        <TextInput
          accessibilityLabel="Message"
          value={value}
          onChangeText={onChangeText}
          placeholder="Ask your question..."
          placeholderTextColor={colors.text.slateMuted}
          style={styles.input}
          onSubmitEditing={onSend}
          returnKeyType="send"
          editable={!disabled}
        />
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Send"
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={onSend}
        style={({ pressed }) => [styles.send, pressed && styles.pressed]}
      >
        <BrandGradient radius={radius.button} angle="shallow" />
        <SendIcon size={ICON_SIZE} />
      </Pressable>
    </View>
  );
}

function createStyles(contentWidth: number, isTablet: boolean) {
  return StyleSheet.create({
  bar: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: isTablet ? contentWidth : undefined,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingLeft: 17,
    paddingRight: spacing.section,
  },
  field: {
    flex: 1,
    height: FIELD_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingLeft: spacing.sm,
    paddingRight: 16.5,
    borderRadius: radius.composer,
    borderWidth: 1,
    borderColor: colors.border.composer,
    backgroundColor: colors.surface,
  },
  pressed: {
    opacity: 0.6,
  },
  input: {
    ...typography.composerInput,
    flex: 1,
    paddingVertical: 0,
    color: colors.text.ink,
  },
  send: {
    width: SEND_SIZE,
    height: SEND_SIZE,
    borderRadius: radius.button,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  });
}
