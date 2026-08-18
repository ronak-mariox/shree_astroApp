import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { AddBankAccountSheet } from '../components/AddBankAccountSheet';
import { BankAttachmentSheet } from '../components/BankAttachmentSheet';
import { BankIntro } from '../components/BankIntro';
import { BrandGradient } from '../components/BrandGradient';
import { EyeIcon } from '../components/icons/BankIcons';
import { ProfileHeader } from '../components/ProfileHeader';
import { TransactionsSheet } from '../components/TransactionsSheet';
import { bankRowsOf, type BankAccount } from '../data/bank';
import { useAppData } from '../state/AppDataProvider';
import { colors, radius, spacing, typography } from '../theme';

const VIEW_BUTTON_WIDTH = 154.817;
const VIEW_BUTTON_HEIGHT = 29.224;
const CTA_HEIGHT = 46;

/** Which sheet, if any, is up over the screen. */
type Sheet =
  | { kind: 'add' }
  | { kind: 'attachment'; account: BankAccount }
  | { kind: 'transactions' }
  | null;

type BankAccountsScreenProps = {
  onBack?: () => void;
};

/**
 * The astrologer's payout accounts: why they are needed, what is on file, the
 * proof behind each status, the ledger settled against them, and the way to
 * file another.
 * Figma: node 110:6514, with its sheets at 110:6793 and 110:6992.
 */
export function BankAccountsScreen({ onBack }: BankAccountsScreenProps) {
  const { bankAccounts, addBankAccount, loadTransactions, error, clearError } =
    useAppData();
  const [sheet, setSheet] = useState<Sheet>(null);

  const close = () => {
    clearError();
    setSheet(null);
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" />

      <ProfileHeader title="Bank Details" onBack={onBack} />

      <ScrollView contentContainerStyle={styles.content}>
        <BankIntro />

        {bankAccounts.map(account => (
          <View key={account.id} style={styles.panel}>
            <Text style={styles.panelTitle}>Banking Information</Text>

            <View style={styles.rows}>
              {bankRowsOf(account).map((row, index) => (
                <React.Fragment key={row.label}>
                  {index > 0 && <View style={styles.rule} />}
                  <View style={styles.row}>
                    <Text style={styles.rowLabel}>{row.label}</Text>

                    {row.attachment && (
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`View attachment for ${account.bankName}`}
                        onPress={() => setSheet({ kind: 'attachment', account })}
                        hitSlop={spacing.md}
                        style={({ pressed }) => pressed && styles.pressed}
                      >
                        <EyeIcon />
                      </Pressable>
                    )}

                    <Text style={styles.rowValue}>{row.value}</Text>
                  </View>
                </React.Fragment>
              ))}
            </View>

            <View style={styles.panelFooter}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="View Trangection"
                onPress={() => setSheet({ kind: 'transactions' })}
                style={({ pressed }) => [
                  styles.viewButton,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.viewLabel}>View Trangection</Text>
              </Pressable>
            </View>
          </View>
        ))}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Add Other Bank Account"
          onPress={() => {
            clearError();
            setSheet({ kind: 'add' });
          }}
          style={({ pressed }) => [styles.cta, pressed && styles.pressed]}
        >
          <BrandGradient radius={radius.button} angle="shallow" />
          <Text style={styles.ctaLabel}>+ Add Other Bank Account</Text>
        </Pressable>
      </ScrollView>

      <AddBankAccountSheet
        visible={sheet?.kind === 'add'}
        error={sheet?.kind === 'add' ? error : null}
        onDismiss={close}
        onSubmit={async (draft, proofFileName) => {
          const filed = await addBankAccount(draft, proofFileName);
          if (filed) {
            setSheet(null);
          }
          return filed;
        }}
      />

      <BankAttachmentSheet
        visible={sheet?.kind === 'attachment'}
        fileName={
          sheet?.kind === 'attachment' ? sheet.account.proofFileName : undefined
        }
        onDismiss={close}
      />

      <TransactionsSheet
        visible={sheet?.kind === 'transactions'}
        load={loadTransactions}
        onDismiss={close}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.canvasSoft,
  },
  content: {
    paddingHorizontal: 12,
    paddingTop: spacing.section,
    paddingBottom: spacing.lg,
    gap: spacing.lg,
  },
  panel: {
    paddingTop: 12,
    paddingBottom: 14,
    borderRadius: radius.input,
    backgroundColor: colors.surface,
  },
  panelTitle: {
    ...typography.profileSection,
    color: colors.text.slateMuted,
    paddingHorizontal: 10,
  },
  rows: {
    paddingHorizontal: 10,
    paddingTop: 12,
    gap: spacing.section,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  rowLabel: {
    ...typography.profileRowLabel,
    flex: 1,
    color: colors.text.slateMuted,
  },
  rowValue: {
    ...typography.profileRowValue,
    color: colors.text.slateMuted,
    textAlign: 'right',
  },
  // The same karmaguru blue-200 at 3% the profile list is ruled with.
  rule: {
    height: 1,
    backgroundColor: colors.border.profileRow,
  },
  pressed: {
    opacity: 0.6,
  },
  panelFooter: {
    alignItems: 'flex-end',
    paddingHorizontal: 10,
    paddingTop: 18,
  },
  viewButton: {
    width: VIEW_BUTTON_WIDTH,
    height: VIEW_BUTTON_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.bank.accent,
    backgroundColor: colors.bank.accentTint,
  },
  viewLabel: {
    ...typography.historyLabel,
    color: colors.bank.accent,
  },
  cta: {
    height: CTA_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.button,
    overflow: 'hidden',
  },
  ctaLabel: {
    ...typography.historyLabel,
    color: colors.text.inverse,
  },
});
