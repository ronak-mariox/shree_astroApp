import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChevronSolidIcon } from './icons/ChatIcons';
import { colors, spacing, typography } from '../theme';

const CHEVRON_WIDTH = 7.36;
const CHEVRON_HEIGHT = 13.25;

type ProfileHeaderProps = {
  title: string;
  onBack?: () => void;
};

/**
 * The yellow strip over either profile screen: a back chevron and the screen's
 * name (Figma nodes 110:6350 and 110:8498, both 90pt tall).
 */
export function ProfileHeader({ title, onBack }: ProfileHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.header, { paddingTop: insets.top + 7 }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Back"
        onPress={onBack}
        hitSlop={spacing.md}
        style={({ pressed }) => [styles.back, pressed && styles.pressed]}
      >
        {/* The chevron is exported pointing right, so Figma flips it. */}
        <View style={styles.backFlip}>
          <ChevronSolidIcon
            width={CHEVRON_WIDTH}
            height={CHEVRON_HEIGHT}
            color={colors.text.ink}
          />
        </View>
      </Pressable>

      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    paddingBottom: spacing.md,
    paddingLeft: 23.36,
    paddingRight: spacing.md,
    backgroundColor: colors.brandYellow,
  },
  back: {
    width: 20,
  },
  backFlip: {
    transform: [{ rotate: '180deg' }],
  },
  pressed: {
    opacity: 0.6,
  },
  title: {
    ...typography.screenTitle,
    flex: 1,
    color: colors.text.ink,
  },
});
