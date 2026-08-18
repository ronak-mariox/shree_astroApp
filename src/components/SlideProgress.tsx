import React from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '../theme';

const DOT_SIZE = 8;
const ACTIVE_WIDTH = 27.999;

type SlideProgressProps = {
  count: number;
  /** Zero-based index of the slide on screen. */
  activeIndex: number;
};

/**
 * The onboarding pager indicator: the current slide stretches into a bar, the
 * rest stay dots (Figma node 104:4988).
 */
export function SlideProgress({ count, activeIndex }: SlideProgressProps) {
  return (
    <View style={styles.track}>
      {Array.from({ length: count }, (_, index) => (
        <View
          key={index}
          style={[styles.dot, index === activeIndex && styles.dotActive]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingTop: spacing.huge,
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: radius.progress,
    backgroundColor: colors.progress.track,
  },
  dotActive: {
    width: ACTIVE_WIDTH,
    backgroundColor: colors.progress.active,
  },
});
