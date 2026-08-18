import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, stroke, typography } from '../theme';
import { CheckIcon } from './icons/CheckIcon';

const BULLET_SIZE = 35.999;
const CHECK_SIZE = 15.999;

type ReviewTimelineProps = {
  steps: ReadonlyArray<string>;
  /** How many leading steps are complete; the rest show their number. */
  completed: number;
};

/**
 * What happens next to a submitted application: completed stages carry a green
 * tick, pending ones their position (Figma nodes 105:6696 – 105:6719).
 */
export function ReviewTimeline({ steps, completed }: ReviewTimelineProps) {
  return (
    <View>
      {steps.map((step, index) => {
        const isDone = index < completed;

        return (
          <View key={step} style={styles.row}>
            <View style={[styles.bullet, isDone && styles.bulletDone]}>
              {isDone ? (
                <CheckIcon size={CHECK_SIZE} color={colors.text.inverse} />
              ) : (
                <Text style={styles.number}>{index + 1}</Text>
              )}
            </View>

            <Text style={[styles.label, isDone && styles.labelDone]}>
              {step}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingBottom: spacing.md,
  },
  bullet: {
    width: BULLET_SIZE,
    height: BULLET_SIZE,
    borderRadius: BULLET_SIZE / 2,
    borderWidth: stroke,
    borderColor: colors.border.hairline,
    backgroundColor: colors.surfaceInset,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bulletDone: {
    borderColor: colors.status.success,
    backgroundColor: colors.status.success,
  },
  number: {
    ...typography.stepNumber,
    color: colors.text.secondary,
  },
  label: {
    ...typography.pageSubtitle,
    color: colors.text.secondary,
  },
  labelDone: {
    ...typography.timelineActive,
    color: colors.text.inkSoft,
  },
});
