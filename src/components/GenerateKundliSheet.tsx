import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { BrandGradient } from './BrandGradient';
import { KundliSheetFrame } from './KundliSheetFrame';
import { OptionPickerSheet } from './OptionPickerSheet';
import { SelectChevronIcon } from './icons/ProfileIcons';
import {
  BIRTH_PLACES,
  DAYS,
  EMPTY_KUNDLI_DRAFT,
  GENDERS,
  HOURS,
  MINUTES,
  MONTHS,
  YEARS,
  type KundliDraft,
} from '../data/kundli';
import { colors, radius, spacing, typography } from '../theme';

const SHEET_HEIGHT = 433;
const FIELD_HEIGHT = 30;
const ACTION_HEIGHT = 31;

/** Which select is picking, and what it offers. */
const PICKERS = {
  gender: { title: 'Gender', options: GENDERS },
  day: { title: 'Day', options: DAYS },
  month: { title: 'Month', options: MONTHS },
  year: { title: 'Year', options: YEARS },
  hour: { title: 'Hour', options: HOURS },
  minute: { title: 'Minute', options: MINUTES },
  birthPlace: { title: 'Birth Place', options: BIRTH_PLACES },
} as const;

type PickerKey = keyof typeof PICKERS;

type GenerateKundliSheetProps = {
  visible: boolean;
  onDismiss: () => void;
  /** Handed the filled birth details once "Generate Kundli" is pressed. */
  onGenerate: (draft: KundliDraft) => void;
};

/**
 * The form the chat header's kundli button opens: who the chart is for and the
 * birth details it needs, over the dimmed conversation.
 * Figma: node 110:3899, over the scrim at 110:3828.
 */
export function GenerateKundliSheet({
  visible,
  onDismiss,
  onGenerate,
}: GenerateKundliSheetProps) {
  const [draft, setDraft] = useState<KundliDraft>(EMPTY_KUNDLI_DRAFT);
  const [picker, setPicker] = useState<PickerKey | null>(null);

  const set = <K extends keyof KundliDraft>(key: K, value: KundliDraft[K]) =>
    setDraft(current => ({ ...current, [key]: value }));

  const close = () => {
    setPicker(null);
    onDismiss();
  };

  const generate = () => {
    setPicker(null);
    onGenerate(draft);
    setDraft(EMPTY_KUNDLI_DRAFT);
  };

  const open = picker ? PICKERS[picker] : null;

  return (
    <KundliSheetFrame
      visible={visible}
      title="Generate kundli"
      designHeight={SHEET_HEIGHT}
      onClose={close}
    >
      <ScrollView
        contentContainerStyle={styles.body}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.field}>
          <Text style={styles.label}>Name</Text>
          <View style={styles.input}>
            <TextInput
              accessibilityLabel="Name"
              placeholder="Name"
              placeholderTextColor={colors.text.placeholderSoft}
              value={draft.name}
              onChangeText={value => set('name', value)}
              style={styles.inputText}
            />
          </View>
        </View>

        <Select
          label="Gender"
          value={draft.gender}
          onPress={() => setPicker('gender')}
        />

        <View style={styles.row}>
          <Select
            label="Day"
            value={draft.day}
            shared
            onPress={() => setPicker('day')}
          />
          <Select
            label="Month"
            value={draft.month}
            shared
            onPress={() => setPicker('month')}
          />
          <Select
            label="Year"
            value={draft.year}
            shared
            onPress={() => setPicker('year')}
          />
        </View>

        <View style={[styles.row, styles.rowWide]}>
          <Select
            label="Hour"
            value={draft.hour}
            shared
            onPress={() => setPicker('hour')}
          />
          <Select
            label="Minute"
            value={draft.minute}
            shared
            onPress={() => setPicker('minute')}
          />
        </View>

        <Select
          label="Birth Place"
          value={draft.birthPlace}
          onPress={() => setPicker('birthPlace')}
        />
      </ScrollView>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Generate Kundli"
        onPress={generate}
        style={({ pressed }) => [styles.action, pressed && styles.pressed]}
      >
        <BrandGradient radius={radius.button} />
        <Text style={styles.actionLabel}>Generate Kundli</Text>
      </Pressable>

      {open && (
        <OptionPickerSheet
          visible
          title={open.title}
          options={open.options}
          value={draft[picker as PickerKey]}
          onDismiss={() => setPicker(null)}
          onConfirm={value => {
            set(picker as PickerKey, value);
            setPicker(null);
          }}
        />
      )}
    </KundliSheetFrame>
  );
}

/** A field that opens a picker rather than the keyboard (node 110:3914). */
function Select({
  label,
  value,
  shared = false,
  onPress,
}: {
  label: string;
  value: string;
  /** Set when the field splits a row with its neighbours. */
  shared?: boolean;
  onPress: () => void;
}) {
  return (
    <View style={[styles.field, shared && styles.fieldShared]}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityValue={{ text: value || 'Not set' }}
        onPress={onPress}
        style={({ pressed }) => [
          styles.input,
          styles.select,
          pressed && styles.pressed,
        ]}
      >
        <Text style={value ? styles.value : styles.placeholder}>
          {value || label}
        </Text>
        <SelectChevronIcon />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    paddingTop: 14,
    paddingHorizontal: 18,
    paddingBottom: spacing.md,
    gap: 10,
  },
  field: {
    gap: 2,
  },
  fieldShared: {
    flex: 1,
  },
  // Day / Month / Year sit 10pt apart, Hour / Minute 16pt (nodes 110:3915,
  // 110:3916).
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  rowWide: {
    gap: 16,
  },
  label: {
    ...typography.searchPlaceholder,
    color: colors.text.ink,
    paddingLeft: 5,
  },
  input: {
    height: FIELD_HEIGHT,
    justifyContent: 'center',
    paddingHorizontal: 9,
    borderRadius: radius.dialChip,
    backgroundColor: colors.surfaceField,
  },
  inputText: {
    ...typography.searchPlaceholder,
    padding: 0,
    color: colors.text.ink,
  },
  select: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  value: {
    ...typography.searchPlaceholder,
    color: colors.text.ink,
  },
  placeholder: {
    ...typography.searchPlaceholder,
    color: colors.text.placeholderSoft,
  },
  action: {
    height: ACTION_HEIGHT,
    marginHorizontal: 18,
    marginBottom: 17,
    borderRadius: radius.button,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  actionLabel: {
    ...typography.sheetAction,
    color: colors.text.inverse,
  },
  pressed: {
    opacity: 0.8,
  },
});
