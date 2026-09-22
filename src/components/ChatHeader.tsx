import React, { useMemo } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { KundliIcon } from './icons/KundliIcon';
import { useResponsive } from '../hooks/useResponsive';
import { colors, radius, typography } from '../theme';

const AVATAR_SIZE = 36;
const PHOTO_SIZE = 34.014;
const BUTTON_SIZE = 36;
const GLYPH_WIDTH = 24.308;
const GLYPH_HEIGHT = 21.548;
/** Figma seats the avatar 10.42pt below the status bar (node 110:496). */
const HEADER_TOP = 10.42;
/** …and closes the 101.864pt header 11.44pt under it (node 110:494). */
const HEADER_BOTTOM = 11.44;
/** The identity column runs 59.95 → 166.95 on the 375pt frame (node 110:498). */
const IDENTITY_WIDTH = 107;

type ChatHeaderProps = {
  name: string;
  /** How long the session has been running, already formatted. */
  elapsed: string;
  onOpenKundli?: () => void;
  onLeave?: () => void;
};

/**
 * The live consultation's yellow header: the seeker, the running timer, and the
 * two square buttons — kundli then leave (Figma nodes 110:494 – 110:522).
 */
export function ChatHeader({
  name,
  elapsed,
  onOpenKundli,
  onLeave,
}: ChatHeaderProps) {
  const insets = useSafeAreaInsets();
  const { px } = useResponsive();
  const styles = useMemo(() => createStyles(px), [px]);

  return (
    <View
      style={[
        styles.header,
        { paddingTop: insets.top + px(HEADER_TOP), paddingBottom: px(HEADER_BOTTOM) },
      ]}
    >
      <View style={styles.avatarWrap}>
        <Image
          source={require('../assets/images/seeker-avatar-ring.png')}
          style={styles.avatarRing}
        />
        <Image
          accessibilityLabel={name}
          source={require('../assets/images/seeker-avatar.png')}
          style={styles.avatarPhoto}
        />
      </View>

      <View style={styles.identity}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.elapsed}>({elapsed})</Text>
      </View>

      <View style={styles.spacer} />

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Kundli details"
        onPress={onOpenKundli}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      >
        {/* Figma masks a solid #111 rectangle with the chart artwork, so the
            glyph is painted in that one ink (node 110:566). */}
        <KundliIcon width={px(GLYPH_WIDTH)} height={px(GLYPH_HEIGHT)} />
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Leave chat"
        onPress={onLeave}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      >
        <Text style={styles.close}>X</Text>
      </Pressable>
    </View>
  );
}

function createStyles(px: (value: number) => number) {
  return StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      // Buttons sit 10pt apart and 13pt off the right edge (nodes 110:502, 110:522).
      gap: 10,
      paddingLeft: px(16.71),
      paddingRight: px(13),
      backgroundColor: colors.brandYellow,
    },
    avatarWrap: {
      width: px(AVATAR_SIZE),
      height: px(AVATAR_SIZE),
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarRing: {
      position: 'absolute',
      width: px(AVATAR_SIZE),
      height: px(AVATAR_SIZE),
      borderRadius: px(AVATAR_SIZE) / 2,
    },
    avatarPhoto: {
      width: px(PHOTO_SIZE),
      height: px(PHOTO_SIZE),
      borderRadius: px(PHOTO_SIZE) / 2,
    },
    identity: {
      width: px(IDENTITY_WIDTH),
      // 59.95 − (16.71 + 36) = 7.24 from the avatar, less the row's 10pt gap.
      marginLeft: px(-2.76),
    },
    name: {
      ...typography.chatName,
      color: colors.text.ink,
      textAlign: 'center',
    },
    elapsed: {
      ...typography.chatTimer,
      color: colors.text.ink,
      paddingLeft: px(3.76),
    },
    spacer: {
      flex: 1,
    },
    button: {
      width: px(BUTTON_SIZE),
      height: px(BUTTON_SIZE),
      borderRadius: radius.chipSmall,
      borderWidth: 1,
      borderColor: colors.text.ink,
      alignItems: 'center',
      justifyContent: 'center',
    },
    pressed: {
      opacity: 0.6,
    },
    close: {
      ...typography.closeMark,
      color: colors.text.ink,
    },
  });
}
