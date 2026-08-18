import React, { type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, hairline, radius, spacing, typography } from '../theme';

type InfoNoteProps = {
  icon: ReactNode;
  children: string;
  /**
   * `brand` is the yellow advisory on the OTP and bank screens (Figma nodes
   * 104:5616, 105:6605); `info` is the blue one on the upload screen
   * (node 105:6322).
   */
  tone?: 'brand' | 'info';
  /** The OTP card is a touch rounder-cornered than the wizard's. */
  cornerRadius?: number;
  /** The bank advisory is padded 2pt taller than the other two. */
  paddingVertical?: number;
};

/**
 * Tinted advisory card — an icon beside a line of explanatory copy.
 */
export function InfoNote({
  icon,
  children,
  tone = 'brand',
  cornerRadius = radius.note,
  paddingVertical = 10.755,
}: InfoNoteProps) {
  return (
    <View
      style={[
        styles.card,
        tone === 'info' ? styles.cardInfo : styles.cardBrand,
        { borderRadius: cornerRadius, paddingVertical },
      ]}
    >
      {icon}
      <Text style={[styles.copy, tone === 'info' && styles.copyInfo]}>
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: 14.755,
    borderWidth: hairline,
  },
  cardBrand: {
    borderColor: colors.border.brandGhost,
    backgroundColor: colors.brandTint.chip,
  },
  cardInfo: {
    borderColor: colors.status.infoTintBorder,
    backgroundColor: colors.status.infoTint,
  },
  copy: {
    ...typography.note,
    flex: 1,
    color: colors.text.secondary,
  },
  copyInfo: {
    color: colors.status.info,
  },
});
