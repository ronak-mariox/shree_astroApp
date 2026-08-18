import React from 'react';
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BrandGradient } from './BrandGradient';
import { MicIcon, PaperclipIcon, SendIcon } from './icons/ChatIcons';
import { colors, radius, spacing, typography } from '../theme';

const FIELD_HEIGHT = 63;
const ROUND_BUTTON = 36;
const SEND_SIZE = 52;
const ICON_SIZE = 20;
/** The composer bar is 83pt tall on the 375pt frame (Figma node 110:504). */
const BAR_HEIGHT = 83;

type ChatComposerProps = {
  value: string;
  onChangeText: (value: string) => void;
  onSend: () => void;
  onAttach?: () => void;
  onRecord?: () => void;
};

/**
 * The message composer: an attach button, the field, a mic, and the gradient
 * send button beside it (Figma nodes 110:504 – 110:518).
 */
export function ChatComposer({
  value,
  onChangeText,
  onSend,
  onAttach,
  onRecord,
}: ChatComposerProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.bar,
        { height: BAR_HEIGHT + insets.bottom, paddingBottom: insets.bottom },
      ]}
    >
      <View style={styles.field}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Attach a file"
          onPress={onAttach}
          style={({ pressed }) => [styles.roundButton, pressed && styles.pressed]}
        >
          <PaperclipIcon />
        </Pressable>

        <TextInput
          accessibilityLabel="Message"
          value={value}
          onChangeText={onChangeText}
          placeholder="Ask your question..."
          placeholderTextColor={colors.text.slateMuted}
          style={styles.input}
          onSubmitEditing={onSend}
          returnKeyType="send"
        />

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Record a voice note"
          onPress={onRecord}
          style={({ pressed }) => [styles.roundButton, pressed && styles.pressed]}
        >
          <MicIcon size={ICON_SIZE} />
        </Pressable>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Send"
        onPress={onSend}
        style={({ pressed }) => [styles.send, pressed && styles.pressed]}
      >
        <BrandGradient radius={radius.button} angle="shallow" />
        <SendIcon size={ICON_SIZE} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
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
  roundButton: {
    width: ROUND_BUTTON,
    height: ROUND_BUTTON,
    borderRadius: ROUND_BUTTON / 2,
    alignItems: 'center',
    justifyContent: 'center',
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
