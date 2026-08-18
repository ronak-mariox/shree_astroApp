import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { BankHalo } from './icons/BankIcons';
import { BANK_INTRO } from '../data/bank';
import { colors, spacing, typography } from '../theme';

/** Figma lays the illustration over a 71.9pt disc (nodes 110:6610, 110:6611). */
const ILLUSTRATION_WIDTH = 105.576;
const ILLUSTRATION_HEIGHT = 58.374;
const BLOCK_HEIGHT = 76.274;
const HALO_LEFT = 20.95;

/**
 * The brief at the top of the Bank Details screen: why the details are needed,
 * beside a banking illustration on its yellow disc.
 * Figma: node 110:6605 — and node 110:7090, where the Documents screen repeats
 * it verbatim, bank copy and all.
 */
export function BankIntro() {
  return (
    <View style={styles.intro}>
      <View style={styles.text}>
        <Text style={styles.title}>Bank Details</Text>
        <Text style={styles.body}>{BANK_INTRO}</Text>
      </View>

      <View style={styles.illustration}>
        <View style={styles.halo}>
          <BankHalo />
        </View>
        <Image
          accessibilityLabel="Online banking"
          source={require('../assets/images/bank-illustration.png')}
          resizeMode="contain"
          style={styles.image}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  intro: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingLeft: 3,
  },
  text: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  title: {
    ...typography.bankHeading,
    color: colors.text.slateMuted,
  },
  body: {
    ...typography.historyLabel,
    color: colors.text.slateMuted,
    // Figma sets the paragraph to 80% (node 110:6608).
    opacity: 0.8,
  },
  illustration: {
    width: ILLUSTRATION_WIDTH,
    height: BLOCK_HEIGHT,
    paddingTop: 19.73,
  },
  halo: {
    position: 'absolute',
    left: HALO_LEFT,
    top: 0,
  },
  image: {
    width: ILLUSTRATION_WIDTH,
    height: ILLUSTRATION_HEIGHT,
    marginTop: 17.9,
  },
});
