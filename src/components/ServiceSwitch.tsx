import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Platform, Pressable, StyleSheet } from 'react-native';

import { colors } from '../theme';

/**
 * Geometry taken straight from the exported switch (Figma node 106:6890): a
 * 37.14 x 19.45 track on a 9.726 radius with a 14.51 x 14.74 thumb inset 4pt
 * from the left edge. Figma only exports the off state, and this has to carry an
 * on state, so it is drawn from views at exactly those measurements rather than
 * rendered as a flat image.
 */
const TRACK_WIDTH = 37.14;
const TRACK_HEIGHT = 19.452;
const TRACK_RADIUS = 9.726;
const THUMB_WIDTH = 14.508;
const THUMB_HEIGHT = 14.736;
const THUMB_INSET = 4;
const THUMB_TRAVEL = TRACK_WIDTH - THUMB_WIDTH - THUMB_INSET * 2;

const TOGGLE_DURATION = 180;

type ServiceSwitchProps = {
  value: boolean;
  onValueChange: (value: boolean) => void;
  accessibilityLabel: string;
};

export function ServiceSwitch({
  value,
  onValueChange,
  accessibilityLabel,
}: ServiceSwitchProps) {
  const progress = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: value ? 1 : 0,
      duration: TOGGLE_DURATION,
      easing: Easing.out(Easing.quad),
      // Color interpolation isn't supported on the native driver.
      useNativeDriver: false,
    }).start();
  }, [progress, value]);

  const translateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, THUMB_TRAVEL],
  });
  const trackColor = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.toggle.track, colors.status.success],
  });

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      accessibilityLabel={accessibilityLabel}
      onPress={() => onValueChange(!value)}
    >
      <Animated.View style={[styles.track, { backgroundColor: trackColor }]}>
        <Animated.View
          style={[styles.thumb, { transform: [{ translateX }] }]}
        />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    width: TRACK_WIDTH,
    height: TRACK_HEIGHT,
    borderRadius: TRACK_RADIUS,
    justifyContent: 'center',
  },
  thumb: {
    position: 'absolute',
    left: THUMB_INSET,
    width: THUMB_WIDTH,
    height: THUMB_HEIGHT,
    borderRadius: THUMB_WIDTH / 2,
    backgroundColor: colors.toggle.thumb,
    // drop-shadow(0 4px 4px rgba(0, 0, 0, 0.25))
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 2,
      },
      android: { elevation: 3 },
      default: {},
    }),
  },
});
