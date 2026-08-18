import React, { useRef } from 'react';
import {
  Platform,
  StyleSheet,
  TextInput,
  View,
  type StyleProp,
  type TextInputInstance,
  type ViewStyle,
} from 'react-native';

import { colors, radius, spacing, stroke, typography } from '../theme';

const BOX_HEIGHT = 44.989;

type OtpInputProps = {
  /** One character per box; shorter strings leave the tail empty. */
  value: string;
  onChangeText: (value: string) => void;
  length?: number;
  style?: StyleProp<ViewStyle>;
};

/**
 * Six single-digit boxes that fill left to right; a box lights up in brand
 * yellow once it holds a digit (Figma nodes 104:5603 empty, 104:5659 filled).
 */
export function OtpInput({
  value,
  onChangeText,
  length = 6,
  style,
}: OtpInputProps) {
  const boxes = useRef<Array<TextInputInstance | null>>([]);
  const digits = Array.from({ length }, (_, index) => value[index] ?? '');

  /** Writes one box and hops to the next, or absorbs a paste of the whole code. */
  const handleChange = (index: number, text: string) => {
    const typed = text.replace(/\D/g, '');
    if (typed.length === 0) {
      return;
    }

    const next = digits.slice();
    for (let offset = 0; offset < typed.length && index + offset < length; offset += 1) {
      next[index + offset] = typed[offset];
    }
    onChangeText(next.join('').slice(0, length));

    const landed = Math.min(index + typed.length, length - 1);
    boxes.current[landed]?.focus();
  };

  /** Backspace on an empty box clears the one before it and steps back. */
  const handleKeyPress = (index: number, key: string) => {
    if (key !== 'Backspace') {
      return;
    }

    const next = digits.slice();
    if (next[index]) {
      next[index] = '';
      onChangeText(next.join(''));
      return;
    }

    if (index > 0) {
      next[index - 1] = '';
      onChangeText(next.join('').slice(0, index - 1));
      boxes.current[index - 1]?.focus();
    }
  };

  return (
    <View style={[styles.row, style]}>
      {digits.map((digit, index) => (
        <TextInput
          key={index}
          ref={box => {
            boxes.current[index] = box;
          }}
          accessibilityLabel={`Digit ${index + 1}`}
          value={digit}
          onChangeText={text => handleChange(index, text)}
          onKeyPress={event => handleKeyPress(index, event.nativeEvent.key)}
          keyboardType="number-pad"
          // iOS needs room for a paste; the handler trims to one digit per box.
          maxLength={length}
          selectTextOnFocus
          style={[styles.box, digit !== '' && styles.boxFilled]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm + 2,
  },
  box: {
    ...typography.otpDigit,
    flex: 1,
    height: BOX_HEIGHT,
    borderRadius: radius.otpBox,
    borderWidth: stroke,
    borderColor: colors.border.field,
    backgroundColor: colors.surface,
    color: colors.text.inkSoft,
    textAlign: 'center',
    paddingVertical: 0,
  },
  boxFilled: {
    borderColor: colors.border.fieldActive,
    backgroundColor: colors.brandTint.field,
    // box-shadow: 0 2px 8px rgba(240, 223, 32, 0.2)
    ...Platform.select({
      ios: {
        shadowColor: colors.brandYellow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        shadowColor: colors.brandYellow,
        elevation: 4,
      },
      default: {},
    }),
  },
});
