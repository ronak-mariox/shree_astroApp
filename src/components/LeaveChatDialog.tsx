import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { CloseCircleIcon } from './icons/ChatIcons';
import { colors, radius, spacing, typography } from '../theme';

const CARD_WIDTH = 338;
const BUTTON_HEIGHT = 46;

type LeaveChatDialogProps = {
  visible: boolean;
  /** "Stay" and the close mark both keep the conversation open. */
  onStay: () => void;
  onLeave: () => void;
};

/**
 * Confirms ending a live consultation (Figma node 110:2610, over the
 * rgba(0,0,0,0.68) scrim at node 110:2750).
 */
export function LeaveChatDialog({
  visible,
  onStay,
  onLeave,
}: LeaveChatDialogProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onStay}
      statusBarTranslucent
    >
      <View style={styles.scrim}>
        <View style={styles.card}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close"
            onPress={onStay}
            hitSlop={spacing.sm}
            style={({ pressed }) => [styles.close, pressed && styles.pressed]}
          >
            <CloseCircleIcon />
          </Pressable>

          <Text style={styles.title}>Do you want to leave this chat?</Text>
          <Text style={styles.body}>
            Once you leave, this conversation can’t be resumed.
          </Text>

          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              onPress={onStay}
              style={({ pressed }) => [
                styles.button,
                styles.stay,
                pressed && styles.pressed,
              ]}
            >
              <Text style={[styles.buttonLabel, styles.stayLabel]}>Stay</Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              onPress={onLeave}
              style={({ pressed }) => [
                styles.button,
                styles.leave,
                pressed && styles.pressed,
              ]}
            >
              <Text style={[styles.buttonLabel, styles.leaveLabel]}>
                Leave Chat
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: {
    flex: 1,
    // Figma stacks 0.68 black at 80% opacity (node 110:2750).
    backgroundColor: colors.scrim,
    opacity: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: CARD_WIDTH,
    paddingTop: 33.76,
    paddingBottom: 12,
    paddingHorizontal: 11,
    borderRadius: radius.input,
    backgroundColor: colors.surface,
  },
  close: {
    position: 'absolute',
    right: 17,
    top: 15,
  },
  pressed: {
    opacity: 0.6,
  },
  title: {
    ...typography.dialogBody,
    fontFamily: typography.sheetTitle.fontFamily,
    color: colors.text.sheet,
    textAlign: 'center',
  },
  body: {
    ...typography.dialogBody,
    color: colors.text.sheet,
    textAlign: 'center',
    paddingTop: 13,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingTop: spacing.xl,
  },
  button: {
    flex: 1,
    height: BUTTON_HEIGHT,
    borderRadius: radius.buttonOutline,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stay: {
    borderWidth: 1,
    borderColor: colors.leave.border,
  },
  leave: {
    backgroundColor: colors.brandYellow,
  },
  buttonLabel: {
    ...typography.dialogButton,
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  stayLabel: {
    color: colors.leave.label,
  },
  leaveLabel: {
    color: colors.text.inverse,
  },
});
