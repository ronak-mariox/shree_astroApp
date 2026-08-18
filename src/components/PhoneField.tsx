import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { colors, hairline, radius, spacing, typography } from '../theme';
import { FieldLabel } from './FieldLabel';

type PhoneFieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  /** Dial code shown in the pill on the left. */
  dialCode?: string;
  placeholder?: string;
  maxLength?: number;
  /**
   * `login` is the 52pt field on the login screen (Figma node 104:5465);
   * `compact` is the 48pt field the registration wizard uses (node 105:6050).
   */
  variant?: 'login' | 'compact';
};

/**
 * Labelled phone field: an all-caps label over a white input whose left edge
 * carries a fixed dial code, ruled off from the number.
 */
export function PhoneField({
  label,
  value,
  onChangeText,
  dialCode = '+91',
  placeholder = 'Enter mobile number',
  maxLength = 10,
  variant = 'login',
}: PhoneFieldProps) {
  const compact = variant === 'compact';

  return (
    <View>
      {compact ? (
        <FieldLabel>{label}</FieldLabel>
      ) : (
        <Text style={styles.label}>{label}</Text>
      )}

      <View style={[styles.field, compact && styles.fieldCompact]}>
        <View style={[styles.dialCode, compact && styles.dialCodeCompact]}>
          <Text style={compact ? styles.dialCodeLabelCompact : styles.dialCodeLabel}>
            {dialCode}
          </Text>
        </View>

        <TextInput
          accessibilityLabel={label}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.text.placeholder}
          keyboardType="number-pad"
          maxLength={maxLength}
          style={[styles.input, compact && styles.inputCompact]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    ...typography.fieldLabel,
    color: colors.text.secondary,
    // Figma seats the label 5pt down inside its 24pt row (node 104:5463).
    paddingTop: 5,
    textTransform: 'uppercase',
  },
  field: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    height: 51.998,
    borderRadius: radius.field,
    borderWidth: hairline,
    borderColor: colors.border.field,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  fieldCompact: {
    marginTop: 6,
    height: 47.998,
    borderRadius: radius.input,
  },
  dialCode: {
    height: '100%',
    justifyContent: 'center',
    paddingLeft: 14,
    paddingRight: 14.755,
    borderRightWidth: hairline,
    borderRightColor: colors.border.hairline,
  },
  dialCodeCompact: {
    paddingLeft: spacing.md,
    paddingRight: 12.755,
  },
  dialCodeLabel: {
    ...typography.countryCode,
    color: colors.text.ink,
  },
  dialCodeLabelCompact: {
    ...typography.countryCodeSmall,
    color: colors.text.inkSoft,
  },
  input: {
    ...typography.input,
    flex: 1,
    height: '100%',
    paddingHorizontal: 14,
    paddingVertical: 0,
    color: colors.text.inkSoft,
  },
  inputCompact: {
    ...typography.inputSmall,
    paddingHorizontal: spacing.md,
  },
});
