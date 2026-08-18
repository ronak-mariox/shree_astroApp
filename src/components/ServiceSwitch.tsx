import React from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

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
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      accessibilityLabel={accessibilityLabel}
      onPress={() => onValueChange(!value)}
      style={[styles.track, value && styles.trackOn]}
    >
      <View
        style={[
          styles.thumb,
          value
            ? { right: THUMB_INSET }
            : { left: THUMB_INSET },
        ]}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    width: TRACK_WIDTH,
    height: TRACK_HEIGHT,
    borderRadius: TRACK_RADIUS,
    backgroundColor: colors.toggle.track,
    justifyContent: 'center',
  },
  trackOn: {
    backgroundColor: colors.status.success,
  },
  thumb: {
    position: 'absolute',
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
