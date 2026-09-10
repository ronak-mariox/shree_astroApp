import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FieldLabel } from '../components/FieldLabel';
import { BackChevronIcon } from '../components/icons/BackChevronIcon';
import { InfoCircleSquareIcon } from '../components/icons/WalletIcons';
import { InfoNote } from '../components/InfoNote';
import { PrimaryButton } from '../components/PrimaryButton';
import {
  WITHDRAW_DEFAULT,
  WITHDRAW_PRESETS,
} from '../data/wallet';
import { useApi } from '../hooks/useApi';
import { fetchEarnings, fetchBankAccounts, requestWithdrawal } from '../services/api';
import {
  colors,
  hairline,
  radius,
  spacing,
  typography,
} from '../theme';

const CHEVRON_SIZE = 21.993;
const NOTE_ICON_SIZE = 9.923;
const CTA_HEIGHT = 51.998;
/** Figma's own floor for a withdrawal (Figma node 112:1472). */
const MINIMUM = 500;

type WithdrawMoneyScreenProps = {
  onBack?: () => void;
  onConfirm?: (amount: string) => void;
};

/**
 * Step one of the withdrawal: how much, out of which account.
 * Figma: node 112:1398.
 */
export function WithdrawMoneyScreen({
  onBack,
  onConfirm,
}: WithdrawMoneyScreenProps) {
  /** What is actually withdrawable, and where it would go. */
  const earnings = useApi(() => fetchEarnings(), []);
  const accounts = useApi(() => fetchBankAccounts(), []);

  const available = `₹${Math.round(earnings.data?.balance ?? 0).toLocaleString('en-IN')}`;
  /** The primary account is the first one on file. */
  const payout = (accounts.data ?? [])[0];

  const insets = useSafeAreaInsets();
  const [amount, setAmount] = useState(WITHDRAW_DEFAULT);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValid = Number(amount || '0') >= MINIMUM;

  const confirm = async () => {
    if (!isValid || submitting) {
      return;
    }
    setSubmitting(true);
    setError(null);

    try {
      await requestWithdrawal(Number(amount), payout?.id);
      onConfirm?.(amount);
    } catch (caught) {
      setError(
        (caught as Error)?.message ?? 'Could not request the withdrawal. Please try again.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" />

      {/* Figma pads the header 48pt from the frame top, 1pt of which clears
          the status bar. */}
      <View style={[styles.header, { paddingTop: insets.top + 1 }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={onBack}
          hitSlop={spacing.sm}
          style={({ pressed }) => pressed && styles.pressed}
        >
          <BackChevronIcon size={CHEVRON_SIZE} />
        </Pressable>

        <Text style={styles.title}>Withdraw Money</Text>
        <Text style={styles.available}>Available: {available}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Enter Amount</Text>

          <View style={styles.amountRow}>
            <Text style={styles.symbol}>₹</Text>
            <TextInput
              accessibilityLabel="Amount"
              value={amount}
              onChangeText={text => setAmount(text.replace(/\D/g, ''))}
              keyboardType="number-pad"
              maxLength={7}
              style={styles.amount}
            />
          </View>

          <View style={styles.presets}>
            {WITHDRAW_PRESETS.map(preset => {
              const isSelected = preset.value === amount;

              return (
                <Pressable
                  key={preset.value}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  onPress={() => setAmount(preset.value)}
                  style={({ pressed }) => [
                    styles.preset,
                    isSelected && styles.presetSelected,
                    pressed && !isSelected && styles.pressed,
                  ]}
                >
                  <Text
                    style={[
                      styles.presetLabel,
                      isSelected && styles.presetLabelSelected,
                    ]}
                  >
                    {preset.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.card}>
          <FieldLabel>Transfer To</FieldLabel>
          <View style={styles.accountRows}>
            <AccountRow label="Bank" value={payout?.bankName ?? '—'} />
            <AccountRow label="Account" value={payout ? `••••${String(payout.accountNumber).slice(-4)}` : '—'} />
            <AccountRow label="IFSC" value={payout?.ifsc ?? '—'} />
          </View>
        </View>

        <InfoNote
          cornerRadius={radius.field}
          paddingVertical={12.755}
          icon={<InfoCircleSquareIcon size={NOTE_ICON_SIZE} />}
        >
          Settlement within 24 hours. Min withdrawal ₹500. Platform deducts 10%
          fee.
        </InfoNote>

        {error && <Text style={styles.error}>{error}</Text>}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: spacing.huge + insets.bottom }]}>
        <PrimaryButton
          label={submitting ? 'Requesting…' : 'Confirm Withdrawal'}
          height={CTA_HEIGHT}
          disabled={!isValid || submitting}
          disabledRadius={radius.field}
          labelStyle={styles.ctaLabel}
          onPress={confirm}
        />
      </View>
    </View>
  );
}

/** One line of the payout account (Figma node 112:1444). */
function AccountRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.accountRow}>
      <Text style={styles.accountLabel}>{label}</Text>
      <Text style={styles.accountValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  header: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingBottom: 20.755,
    borderBottomWidth: hairline,
    borderBottomColor: colors.border.hairline,
  },
  pressed: {
    opacity: 0.6,
  },
  title: {
    ...typography.wizardTitle,
    fontSize: 22,
    lineHeight: 33,
    color: colors.text.inkSoft,
    paddingTop: 18.6,
  },
  available: {
    ...typography.meta,
    color: colors.text.secondary,
  },
  content: {
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.lg,
  },
  card: {
    padding: 19.755,
    borderRadius: radius.card,
    borderWidth: hairline,
    borderColor: colors.border.hairline,
    backgroundColor: colors.surface,
  },
  cardLabel: {
    ...typography.meta,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingTop: spacing.sm,
  },
  symbol: {
    ...typography.displaySymbol,
    color: colors.text.ink,
  },
  amount: {
    ...typography.displayLarge,
    width: 140,
    paddingVertical: 0,
    color: colors.text.inkSoft,
    textAlign: 'center',
  },
  presets: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingTop: spacing.md,
  },
  preset: {
    paddingHorizontal: 12.755,
    paddingVertical: 5.755,
    borderRadius: radius.action,
    borderWidth: hairline,
    borderColor: colors.border.hairline,
    backgroundColor: colors.surface,
  },
  presetSelected: {
    borderColor: colors.border.selected,
    backgroundColor: colors.brandYellow,
  },
  presetLabel: {
    ...typography.note,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  presetLabelSelected: {
    color: colors.text.ink,
  },
  accountRows: {
    paddingTop: spacing.md,
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
    paddingBottom: 8.755,
    borderBottomWidth: hairline,
    borderBottomColor: colors.border.hairline,
  },
  accountLabel: {
    ...typography.meta,
    color: colors.text.secondary,
  },
  accountValue: {
    ...typography.metaStrong,
    color: colors.text.inkSoft,
  },
  footer: {
    paddingTop: spacing.section,
    paddingHorizontal: spacing.lg,
  },
  ctaLabel: {
    ...typography.buttonStrong,
    color: colors.text.onGradient,
  },
  error: {
    ...typography.note,
    color: colors.status.danger,
    textAlign: 'center',
  },
});
