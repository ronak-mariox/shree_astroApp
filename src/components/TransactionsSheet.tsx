import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { BottomSheet } from './BottomSheet';
import { NoRequestsIcon } from './icons/ProfileIcons';
import { type BankTransaction } from '../data/bank';
import { colors, spacing, typography } from '../theme';

type TransactionsSheetProps = {
  visible: boolean;
  onDismiss: () => void;
  /** Fetched each time the sheet opens, so a new payout shows up. */
  load: () => Promise<BankTransaction[]>;
};

/**
 * The ledger behind "View Trangection". Figma designs the button but not what
 * it opens, so this borrows the empty state from the edit screen's
 * change-request panel (node 110:7722).
 */
export function TransactionsSheet({
  visible,
  onDismiss,
  load,
}: TransactionsSheetProps) {
  const [transactions, setTransactions] = useState<BankTransaction[] | null>(
    null,
  );

  useEffect(() => {
    if (!visible) {
      setTransactions(null);
      return;
    }

    let live = true;
    load()
      .then(next => {
        if (live) setTransactions(next);
      })
      .catch(() => {
        if (live) setTransactions([]);
      });
    return () => {
      live = false;
    };
  }, [visible, load]);

  return (
    <BottomSheet visible={visible} title="Transactions" onDismiss={onDismiss}>
      <View style={styles.body}>
        {transactions === null && (
          <View style={styles.centred}>
            <ActivityIndicator color={colors.text.slateMuted} />
          </View>
        )}

        {transactions?.length === 0 && (
          <View style={[styles.centred, styles.empty]}>
            <NoRequestsIcon />
            <Text style={styles.emptyLabel}>No transactions yet</Text>
          </View>
        )}

        {transactions?.map((transaction, index) => (
          <View key={transaction.id}>
            {index > 0 && <View style={styles.rule} />}
            <View style={styles.row}>
              <View style={styles.rowText}>
                <Text style={styles.reference}>{transaction.reference}</Text>
                <Text style={styles.date}>{transaction.date}</Text>
              </View>
              <View style={styles.rowAmount}>
                <Text style={styles.amount}>{transaction.amount}</Text>
                <Text style={styles.status}>{transaction.status}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  body: {
    minHeight: 180,
    paddingHorizontal: 10.86,
    paddingTop: 12,
    paddingBottom: spacing.xl,
  },
  centred: {
    flex: 1,
    minHeight: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    gap: spacing.sm,
    // The same half strength the change-request panel uses.
    opacity: 0.5,
  },
  emptyLabel: {
    ...typography.profileRowLabel,
    color: colors.text.slateMuted,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    gap: spacing.md,
  },
  rowText: {
    flex: 1,
  },
  reference: {
    ...typography.profileRowValue,
    color: colors.text.slateMuted,
  },
  date: {
    ...typography.profileRowLabel,
    color: colors.text.slateMuted,
    opacity: 0.8,
  },
  rowAmount: {
    alignItems: 'flex-end',
  },
  amount: {
    ...typography.profileRowValue,
    color: colors.text.sheet,
  },
  status: {
    ...typography.profileRowLabel,
    color: colors.history.credit,
  },
  rule: {
    height: 1,
    backgroundColor: colors.border.profileRow,
  },
});
