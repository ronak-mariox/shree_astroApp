import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { HistoryEntry } from '../data/history';
import { colors, radius, typography } from '../theme';

const ACTION_WIDTH = 111;
const ACTION_HEIGHT = 28;
const ACTION_RADIUS = 22;

type HistoryCardProps = {
  entry: HistoryEntry;
  /** The first action is "Chat" on the chat history and "Audio" on the call one. */
  primaryAction: string;
  onPrimary?: () => void;
  onRefund?: () => void;
  onBlock?: () => void;
};

/**
 * One consultation in the history: its six fields over the three actions
 * (Figma node 110:8942).
 */
export function HistoryCard({
  entry,
  primaryAction,
  onPrimary,
  onRefund,
  onBlock,
}: HistoryCardProps) {
  return (
    <View style={styles.card}>
      <Row label="User Name" value={entry.userName} />
      <Row label="Amount Received" value={entry.amount} tone="credit" />
      <Row label="Date & Time" value={entry.dateTime} />
      <Row label="Duration" value={entry.duration} />
      <Row label="Refund Status" value={entry.refundStatus} strong />
      <Row label="Refund Date" value={entry.refundDate} strong />

      <View style={styles.actions}>
        <Action label={primaryAction} onPress={onPrimary} />
        <Action label="Refund" tone="credit" onPress={onRefund} />
        <Action label="Block" tone="block" onPress={onBlock} />
      </View>
    </View>
  );
}

function Row({
  label,
  value,
  tone,
  strong,
}: {
  label: string;
  value: string;
  tone?: 'credit';
  strong?: boolean;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text
        style={[
          strong ? styles.valueStrong : styles.value,
          tone === 'credit' && styles.valueCredit,
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

function Action({
  label,
  tone,
  onPress,
}: {
  label: string;
  tone?: 'credit' | 'block';
  onPress?: () => void;
}) {
  const color =
    tone === 'credit'
      ? colors.history.credit
      : tone === 'block'
        ? colors.history.block
        : colors.text.sheet;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.action,
        { borderColor: color },
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.actionLabel, { color }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingTop: 12,
    paddingBottom: 14.5,
    paddingHorizontal: 17.86,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.border.historyCard,
    backgroundColor: colors.surface,
  },
  // Figma stacks the six fields 22.2pt apart (nodes 110:8945 – 110:8956).
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 22.2,
  },
  label: {
    ...typography.historyLabel,
    color: colors.text.sheet,
  },
  value: {
    ...typography.historyValue,
    color: colors.text.sheet,
    textAlign: 'right',
  },
  valueStrong: {
    ...typography.historyValueStrong,
    color: colors.text.sheet,
    textAlign: 'right',
  },
  valueCredit: {
    ...typography.historyValueStrong,
    color: colors.history.credit,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 17.3,
  },
  action: {
    width: ACTION_WIDTH,
    height: ACTION_HEIGHT,
    borderRadius: ACTION_RADIUS,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.6,
  },
  actionLabel: {
    ...typography.historyAction,
    textAlign: 'center',
    textTransform: 'capitalize',
  },
});
