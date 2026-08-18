import React, { type ReactNode } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import { colors, stroke } from '../theme';

const HALO_SIZE = 127.995;

type IconHaloProps = {
  children: ReactNode;
};

/**
 * Yellow-tinted disc behind each onboarding icon, ringed by a translucent
 * brand stroke and blooming outwards (Figma node 104:4979).
 */
export function IconHalo({ children }: IconHaloProps) {
  return <View style={styles.halo}>{children}</View>;
}

const styles = StyleSheet.create({
  halo: {
    width: HALO_SIZE,
    height: HALO_SIZE,
    borderRadius: HALO_SIZE / 2,
    borderWidth: stroke,
    borderColor: colors.border.brandFaint,
    backgroundColor: colors.brandTint.halo,
    alignItems: 'center',
    justifyContent: 'center',
    // box-shadow: 0 0 40px rgba(240, 223, 32, 0.2)
    ...Platform.select({
      ios: {
        shadowColor: colors.brandYellow,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 40,
      },
      android: {
        shadowColor: colors.brandYellow,
        elevation: 10,
      },
      default: {},
    }),
  },
});
