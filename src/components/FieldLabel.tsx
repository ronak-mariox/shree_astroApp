import React from 'react';
import { StyleSheet, Text, type StyleProp, type TextStyle } from 'react-native';

import { colors, typography } from '../theme';

type FieldLabelProps = {
  children: string;
  style?: StyleProp<TextStyle>;
};

/**
 * The all-caps label that heads every control in the registration wizard
 * (Figma node 105:6040).
 */
export function FieldLabel({ children, style }: FieldLabelProps) {
  return <Text style={[styles.label, style]}>{children}</Text>;
}

const styles = StyleSheet.create({
  label: {
    ...typography.formLabel,
    color: colors.text.secondary,
    textTransform: 'uppercase',
  },
});
