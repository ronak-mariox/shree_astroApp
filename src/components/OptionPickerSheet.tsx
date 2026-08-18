import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { BottomSheet } from './BottomSheet';
import { BrandGradient } from './BrandGradient';
import { RadioMark } from './icons/DocumentFlowIcons';
import { colors, radius, spacing, typography } from '../theme';

const ROW_HEIGHT = 40;
const ACTION_HEIGHT = 34.65;

type OptionPickerSheetProps = {
  visible: boolean;
  title: string;
  options: ReadonlyArray<string>;
  /** A comma-separated list when `multiple`, otherwise the single value. */
  value: string;
  /** Skills are picked several at a time; gender and language are not. */
  multiple?: boolean;
  onDismiss: () => void;
  onConfirm: (value: string) => void;
};

/** How the design prints a multi-pick value, e.g. "Numerology , Tarot". */
const JOINER = ' , ';

const parse = (value: string) =>
  value
    .split(',')
    .map(part => part.trim())
    .filter(Boolean);

/**
 * The picker behind a select field on the edit form. Figma designs the field
 * but not the list it opens, so this follows the document-type chips on the
 * upload sheet (node 110:7414) — the nearest thing the design does specify.
 */
export function OptionPickerSheet({
  visible,
  title,
  options,
  value,
  multiple = false,
  onDismiss,
  onConfirm,
}: OptionPickerSheetProps) {
  const [chosen, setChosen] = useState<string[]>(() => parse(value));

  // Reopening the sheet starts from whatever the field holds now.
  useEffect(() => {
    if (visible) {
      setChosen(parse(value));
    }
  }, [visible, value]);

  const toggle = (option: string) => {
    if (!multiple) {
      setChosen([option]);
      return;
    }
    setChosen(current =>
      current.includes(option)
        ? current.filter(item => item !== option)
        : [...current, option],
    );
  };

  return (
    <BottomSheet visible={visible} title={title} onDismiss={onDismiss}>
      <ScrollView contentContainerStyle={styles.body}>
        {options.map(option => {
          const selected = chosen.includes(option);
          return (
            <Pressable
              key={option}
              accessibilityRole={multiple ? 'checkbox' : 'radio'}
              accessibilityLabel={option}
              accessibilityState={{ selected }}
              onPress={() => toggle(option)}
              style={({ pressed }) => [
                styles.row,
                selected ? styles.rowSelected : styles.rowIdle,
                pressed && styles.pressed,
              ]}
            >
              <RadioMark selected={selected} />
              <Text style={selected ? styles.labelSelected : styles.label}>
                {option}
              </Text>
            </Pressable>
          );
        })}

        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Cancel"
            onPress={onDismiss}
            style={({ pressed }) => [
              styles.action,
              styles.cancel,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.cancelLabel}>Cancel</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Done"
            disabled={chosen.length === 0}
            onPress={() => onConfirm(chosen.join(multiple ? JOINER : ''))}
            style={({ pressed }) => [
              styles.action,
              styles.done,
              chosen.length === 0 && styles.disabled,
              pressed && styles.pressed,
            ]}
          >
            <BrandGradient radius={radius.button} angle="shallow" />
            <Text style={styles.doneLabel}>Done</Text>
          </Pressable>
        </View>
      </ScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  body: {
    paddingHorizontal: 10.86,
    paddingTop: 12,
    paddingBottom: spacing.lg,
    gap: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: ROW_HEIGHT,
    paddingHorizontal: 10,
    borderRadius: radius.thumb,
  },
  rowIdle: {
    borderWidth: 1,
    borderColor: colors.border.optionChip,
  },
  rowSelected: {
    backgroundColor: colors.brandYellow,
  },
  label: {
    ...typography.menuMeta,
    color: colors.text.slateMuted,
  },
  labelSelected: {
    ...typography.optionChipSelected,
    color: colors.text.ink,
  },
  pressed: {
    opacity: 0.6,
  },
  disabled: {
    opacity: 0.4,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: 7.4,
    paddingTop: 14,
  },
  action: {
    flex: 1,
    height: ACTION_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  cancel: {
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.border.strong,
  },
  cancelLabel: {
    ...typography.historyAction,
    color: colors.border.strong,
    textTransform: 'capitalize',
  },
  done: {
    borderRadius: radius.button,
  },
  doneLabel: {
    ...typography.historyAction,
    color: colors.text.inverse,
    textTransform: 'capitalize',
  },
});
