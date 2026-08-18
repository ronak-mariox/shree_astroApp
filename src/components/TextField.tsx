import React from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  type KeyboardTypeOptions,
} from 'react-native';

import { colors, hairline, radius, typography } from '../theme';
import { FieldLabel } from './FieldLabel';

const FIELD_HEIGHT = 47.998;

type TextFieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  maxLength?: number;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
};

/**
 * Labelled single-line field used throughout the registration wizard. Figma
 * outlines it in brand yellow once it holds a value (Figma nodes 105:6042
 * empty, 105:6616 filled).
 */
export function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  maxLength,
  autoCapitalize = 'sentences',
}: TextFieldProps) {
  return (
    <View>
      <FieldLabel style={styles.label}>{label}</FieldLabel>

      <TextInput
        accessibilityLabel={label}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.text.placeholder}
        keyboardType={keyboardType}
        maxLength={maxLength}
        autoCapitalize={autoCapitalize}
        style={[styles.field, value.length > 0 && styles.fieldFilled]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    paddingBottom: 6,
  },
  field: {
    ...typography.inputSmall,
    height: FIELD_HEIGHT,
    paddingHorizontal: 14.755,
    paddingVertical: 0,
    borderRadius: radius.input,
    borderWidth: hairline,
    borderColor: colors.border.field,
    backgroundColor: colors.surface,
    color: colors.text.inkSoft,
  },
  fieldFilled: {
    borderColor: colors.border.fieldActive,
  },
});
