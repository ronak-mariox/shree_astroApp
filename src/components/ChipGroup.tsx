import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, hairline, radius, spacing, typography } from '../theme';
import { FieldLabel } from './FieldLabel';

const CHIP_HEIGHT = 35.503;

type ChipGroupProps = {
  label: string;
  options: ReadonlyArray<string>;
  selected: ReadonlyArray<string>;
  onToggle: (value: string) => void;
  /**
   * Figma tints a chosen specialization brand yellow with an ink outline
   * (node 105:6198) and a chosen language blue (node 105:6225).
   */
  tone?: 'brand' | 'info';
};

/**
 * A wrapping set of multi-select pills (Figma nodes 105:6194, 105:6221).
 */
export function ChipGroup({
  label,
  options,
  selected,
  onToggle,
  tone = 'brand',
}: ChipGroupProps) {
  return (
    <View>
      <FieldLabel>{label}</FieldLabel>

      <View style={styles.row}>
        {options.map(option => {
          const isSelected = selected.includes(option);

          return (
            <Pressable
              key={option}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: isSelected }}
              onPress={() => onToggle(option)}
              style={({ pressed }) => [
                styles.chip,
                isSelected &&
                  (tone === 'info' ? styles.chipInfo : styles.chipBrand),
                pressed && !isSelected && styles.pressed,
              ]}
            >
              <Text
                style={[
                  styles.label,
                  isSelected &&
                    (tone === 'info' ? styles.labelInfo : styles.labelBrand),
                ]}
              >
                {option}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingTop: 6,
  },
  chip: {
    height: CHIP_HEIGHT,
    paddingHorizontal: 14.755,
    borderRadius: radius.chip,
    borderWidth: hairline,
    borderColor: colors.border.hairline,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipBrand: {
    backgroundColor: colors.brandYellow,
    borderColor: colors.border.selected,
  },
  chipInfo: {
    backgroundColor: colors.status.infoTintStrong,
    borderColor: colors.status.info,
  },
  pressed: {
    opacity: 0.6,
  },
  label: {
    ...typography.chipLabel,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  labelBrand: {
    color: colors.text.ink,
  },
  labelInfo: {
    color: colors.status.info,
  },
});
