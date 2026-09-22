import React, { type ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, hairline, radius, spacing, typography } from '../theme';
import { CheckIcon } from './icons/CheckIcon';
import { UploadArrowIcon } from './icons/DocumentIcons';

const ICON_WELL_SIZE = 41.993;
const ACTION_SIZE = 31.999;
const ACTION_ICON_SIZE = 14.997;
const CHECK_SIZE = 19.999;

/** `idle` — nothing filed yet. `done` — landed on the server; the row and its icon well turn green. */
export type UploadStatus = 'idle' | 'done';

type UploadRowProps = {
  title: string;
  /** Format and size limit while idle; the outcome once done. */
  hint: string;
  icon: ReactNode;
  status: UploadStatus;
  /** While the picked file is actually uploading — swaps the action for a spinner. */
  busy?: boolean;
  onUpload?: () => void;
};

/**
 * A dashed document row that turns green — and its icon well, a checkmark —
 * once a file has actually landed on the server (Figma nodes 105:6330
 * pending, 105:6482 uploaded).
 */
export function UploadRow({
  title,
  hint,
  icon,
  status,
  busy = false,
  onUpload,
}: UploadRowProps) {
  const done = status === 'done';

  return (
    <View style={[styles.row, done && styles.rowUploaded]}>
      <View style={[styles.well, done && styles.wellUploaded]}>
        {done ? <CheckIcon size={CHECK_SIZE} /> : icon}
      </View>

      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.hint}>{hint}</Text>
      </View>

      {done ? (
        <Text style={styles.done}>Done</Text>
      ) : busy ? (
        <View style={styles.action}>
          <ActivityIndicator size="small" color={colors.text.ink} />
        </View>
      ) : (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Upload ${title}`}
          onPress={onUpload}
          style={({ pressed }) => [styles.action, pressed && styles.pressed]}
        >
          <UploadArrowIcon size={ACTION_ICON_SIZE} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16.755,
    paddingVertical: 14.755,
    borderRadius: radius.field,
    borderWidth: hairline,
    borderStyle: 'dashed',
    borderColor: colors.border.hairline,
    backgroundColor: colors.surface,
  },
  rowUploaded: {
    borderColor: colors.status.success,
    backgroundColor: colors.status.successTint,
  },
  well: {
    width: ICON_WELL_SIZE,
    height: ICON_WELL_SIZE,
    borderRadius: radius.input,
    backgroundColor: colors.surfaceInset,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wellUploaded: {
    backgroundColor: colors.status.successTintStrong,
  },
  copy: {
    flex: 1,
  },
  title: {
    ...typography.rowTitle,
    color: colors.text.inkSoft,
  },
  hint: {
    ...typography.note,
    color: colors.text.secondary,
    paddingTop: 2,
  },
  action: {
    width: ACTION_SIZE,
    height: ACTION_SIZE,
    borderRadius: radius.chipSmall,
    backgroundColor: colors.brandYellow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
  done: {
    ...typography.statusLabel,
    color: colors.status.success,
  },
});

type UploadCounterProps = {
  uploaded: number;
  total: number;
};

/**
 * "0 / 5 uploaded" over a bar per document, ruled off from the rows above
 * (Figma nodes 105:6426, 105:6557).
 */
export function UploadCounter({ uploaded, total }: UploadCounterProps) {
  return (
    <View style={counterStyles.row}>
      <Text style={counterStyles.label}>
        {uploaded} / {total} uploaded
      </Text>

      <View style={counterStyles.bars}>
        {Array.from({ length: total }, (_, index) => (
          <View
            key={index}
            style={[
              counterStyles.bar,
              index < uploaded && counterStyles.barFilled,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const counterStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10.755,
    paddingBottom: 10,
    borderTopWidth: hairline,
    borderTopColor: colors.border.hairline,
  },
  label: {
    ...typography.meta,
    color: colors.text.secondary,
  },
  bars: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  bar: {
    width: 27.999,
    height: 4,
    borderRadius: radius.progressBar,
    backgroundColor: colors.surfaceDisabled,
  },
  barFilled: {
    backgroundColor: colors.status.success,
  },
});
