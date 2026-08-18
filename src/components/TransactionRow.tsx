import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, hairline, radius, spacing, typography } from '../theme';
import { TrendingUpIcon } from './icons/DashboardIcons';
import { BankIcon, InfoCircleSquareIcon } from './icons/WalletIcons';

const WELL_SIZE = 41.993;
const ICON_SIZE = 17.993;

/**
 * What a line of the transaction history represents: money earned, money moved
 * to the bank, or the platform's cut (Figma nodes 112:1248 – 112:1333).
 */
export type TransactionKind = 'credit' | 'withdrawal' | 'fee';

export type Transaction = {
  id: string;
  title: string;
  /** Channel and when, already joined with the design's middle dot. */
  meta: string;
  /** Signed and formatted, e.g. `+₹625`. */
  amount: string;
  kind: TransactionKind;
};

type TransactionRowProps = {
  transaction: Transaction;
};

export function TransactionRow({ transaction }: TransactionRowProps) {
  const { kind } = transaction;

  return (
    <View style={styles.row}>
      <View style={[styles.well, wellStyles[kind]]}>
        {kind === 'credit' && <TrendingUpIcon size={ICON_SIZE} />}
        {kind === 'withdrawal' && (
          <BankIcon size={ICON_SIZE} color={colors.status.danger} />
        )}
        {kind === 'fee' && <InfoCircleSquareIcon size={ICON_SIZE} />}
      </View>

      <View style={styles.copy}>
        <Text style={styles.title}>{transaction.title}</Text>
        <Text style={styles.meta}>{transaction.meta}</Text>
      </View>

      <Text style={[styles.amount, amountStyles[kind]]}>
        {transaction.amount}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    padding: 4.755,
    borderRadius: radius.panel,
    borderWidth: hairline,
    borderColor: colors.border.hairline,
    backgroundColor: colors.surface,
  },
  well: {
    width: WELL_SIZE,
    height: WELL_SIZE,
    borderRadius: radius.input,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    paddingLeft: spacing.sm,
  },
  title: {
    ...typography.rowTitle,
    color: colors.text.inkSoft,
  },
  meta: {
    ...typography.note,
    color: colors.text.secondary,
    paddingTop: 2,
  },
  amount: {
    ...typography.amount,
    paddingRight: spacing.sm,
  },
});

const wellStyles = StyleSheet.create({
  credit: { backgroundColor: colors.status.successWell },
  withdrawal: { backgroundColor: colors.status.dangerTint },
  fee: { backgroundColor: colors.status.warningWell },
});

const amountStyles = StyleSheet.create({
  credit: { color: colors.status.success },
  withdrawal: { color: colors.status.danger },
  fee: { color: colors.status.danger },
});
