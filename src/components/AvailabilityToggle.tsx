import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, hairline, radius, typography } from '../theme';

const SEGMENT_HEIGHT = 35;
const SEGMENT_WIDTH = 53;

type AvailabilityToggleProps = {
  online: boolean;
  onChange: (online: boolean) => void;
};

/**
 * The Offline / Online segmented control in the dashboard header; the live half
 * fills green (Figma nodes 105:6743 – 105:6747).
 */
export function AvailabilityToggle({
  online,
  onChange,
}: AvailabilityToggleProps) {
  return (
    <View style={styles.track}>
      <Pressable
        accessibilityRole="radio"
        accessibilityState={{ selected: !online }}
        onPress={() => onChange(false)}
        style={[styles.segment, !online && styles.segmentSelected]}
      >
        <Text style={[styles.label, !online && styles.labelSelected]}>
          Offline
        </Text>
      </Pressable>

      <Pressable
        accessibilityRole="radio"
        accessibilityState={{ selected: online }}
        onPress={() => onChange(true)}
        style={[styles.segment, online && styles.segmentSelected]}
      >
        <Text style={[styles.label, online && styles.labelSelected]}>
          Online
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    borderRadius: radius.segment,
    borderWidth: hairline,
    borderColor: colors.border.hairline,
    backgroundColor: colors.surfaceInset,
  },
  segment: {
    width: SEGMENT_WIDTH,
    height: SEGMENT_HEIGHT,
    borderRadius: radius.segmentPill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentSelected: {
    backgroundColor: colors.status.success,
  },
  label: {
    ...typography.segmentLabel,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  labelSelected: {
    color: colors.text.inverse,
  },
});
