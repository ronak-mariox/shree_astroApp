import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, hairline, radius, spacing, typography } from '../theme';
import { FieldLabel } from './FieldLabel';

const OPTION_HEIGHT = 43.998;

export type Option = {
  /** Stored value. */
  value: string;
  label: string;
  /** Options that carry their own width rather than sharing the row evenly. */
  width?: number;
};

type OptionGroupProps = {
  label: string;
  options: ReadonlyArray<Option>;
  selected: string | null;
  onSelect: (value: string) => void;
  /**
   * `md` is the 14pt row Gender uses (node 105:6069); `sm` is the tighter 13pt
   * row Experience and Rate use (nodes 105:6249, 105:6267), whose unselected
   * labels are set in grey.
   */
  size?: 'md' | 'sm';
};

/**
 * A row of mutually exclusive options; the chosen one fills with brand yellow
 * (Figma nodes 105:6068 unselected, 105:6142 selected).
 */
export function OptionGroup({
  label,
  options,
  selected,
  onSelect,
  size = 'md',
}: OptionGroupProps) {
  return (
    <View>
      <FieldLabel>{label}</FieldLabel>

      <View style={styles.row}>
        {options.map(option => {
          const isSelected = option.value === selected;

          return (
            <Pressable
              key={option.value}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}
              onPress={() => onSelect(option.value)}
              style={({ pressed }) => [
                styles.option,
                option.width ? { width: option.width } : styles.optionFlex,
                isSelected && styles.optionSelected,
                pressed && !isSelected && styles.pressed,
              ]}
            >
              <Text
                style={[
                  size === 'sm' ? styles.labelSmall : styles.label,
                  isSelected
                    ? styles.labelSelected
                    : size === 'sm' && styles.labelMuted,
                ]}
              >
                {option.label}
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
    gap: spacing.sm,
    paddingTop: 6,
  },
  option: {
    height: OPTION_HEIGHT,
    borderRadius: radius.input,
    borderWidth: hairline,
    borderColor: colors.border.hairline,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionFlex: {
    flex: 1,
  },
  optionSelected: {
    backgroundColor: colors.brandYellow,
    borderColor: colors.border.fieldActive,
  },
  pressed: {
    opacity: 0.6,
  },
  label: {
    ...typography.optionLabel,
    color: colors.text.inkSoft,
    textAlign: 'center',
  },
  labelSmall: {
    ...typography.optionLabelSmall,
    color: colors.text.inkSoft,
    textAlign: 'center',
  },
  labelMuted: {
    color: colors.text.secondary,
  },
  labelSelected: {
    color: colors.text.ink,
  },
});
