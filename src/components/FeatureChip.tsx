import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, hairline, radius, typography } from '../theme';

const CHIP_HEIGHT = 31.491;

type FeatureChipProps = {
  label: string;
};

/**
 * Pill listing one of the platform's features on the astrologer welcome
 * screen (Figma node 104:5402).
 */
export function FeatureChip({ label }: FeatureChipProps) {
  return (
    <View style={styles.chip}>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    height: CHIP_HEIGHT,
    paddingHorizontal: 14.755,
    borderRadius: radius.chip,
    borderWidth: hairline,
    borderColor: colors.border.brandFaint,
    backgroundColor: colors.brandTint.chip,
    justifyContent: 'center',
  },
  label: {
    ...typography.chipLabel,
    color: colors.text.ink,
  },
});
