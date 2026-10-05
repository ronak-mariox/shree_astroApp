import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { FieldLabel } from '../components/FieldLabel';
import { PadlockIcon } from '../components/icons/NoticeIcons';
import { InfoNote } from '../components/InfoNote';
import { TextField } from '../components/TextField';
import { WizardFooter } from '../components/WizardFooter';
import { WizardHeader } from '../components/WizardHeader';
import { QUICK_SELECT_BANKS, REGISTRATION_STEPS } from '../data/registration';
import { addBankAccount, submitApplication } from '../services/api';
import {
  colors,
  hairline,
  radius,
  spacing,
  typography,
} from '../theme';

const BANK_CHIP_HEIGHT = 31.491;

export type BankDetails = {
  bankName: string;
  accountNumber: string;
  ifsc: string;
};

type BankDetailsScreenProps = {
  /** Prefills the account holder's name — most payout accounts are the astrologer's own. */
  holderNameDefault?: string;
  onBack?: () => void;
  /** Fires once the account is filed and the application has been submitted for review. */
  onSubmit?: () => void;
};

/**
 * Step 4 of registration: where the earnings land. The account number has to be
 * keyed twice and the two have to agree before the application can go in.
 * Figma: node 105:6583.
 *
 * Submitting here does two real things in sequence: files the bank account
 * (`POST /astrologer/me/bank-accounts`), then closes the application out
 * (`POST /astrologer/me/submit`) — the backend refuses that second call unless
 * at least one document and one bank account are already on file, which by
 * this point in the wizard they are.
 */
export function BankDetailsScreen({
  holderNameDefault = '',
  onBack,
  onSubmit,
}: BankDetailsScreenProps) {
  const [holderName, setHolderName] = useState(holderNameDefault);
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [confirmAccount, setConfirmAccount] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isComplete =
    holderName.trim().length > 0 &&
    bankName.trim().length > 0 &&
    accountNumber.length > 0 &&
    confirmAccount === accountNumber &&
    ifsc.trim().length > 0;

  const submit = async () => {
    if (!isComplete || submitting) {
      return;
    }
    setSubmitting(true);
    setError(null);

    try {
      await addBankAccount({
        holderName,
        bankName,
        accountNumber,
        confirmAccountNumber: confirmAccount,
        ifsc,
      });
      await submitApplication();
      onSubmit?.();
    } catch (caught) {
      setError(
        (caught as Error)?.message ?? 'Something went wrong. Please try again.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" />

      <WizardHeader
        step={4}
        totalSteps={REGISTRATION_STEPS}
        title="Bank Details"
        onBack={onBack}
      />

      <KeyboardAvoidingView
        behavior="padding"
        style={styles.body}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <InfoNote
            cornerRadius={radius.input}
            paddingVertical={12.755}
            icon={<PadlockIcon />}
          >
            Earnings will be transferred to this account. Details are encrypted
            with bank-grade security.
          </InfoNote>

          <TextField
            label="Account Holder Name"
            value={holderName}
            onChangeText={setHolderName}
            placeholder="As printed on the passbook"
            autoCapitalize="words"
          />

          <TextField
            label="Bank Name"
            value={bankName}
            onChangeText={setBankName}
            placeholder="SBI"
            autoCapitalize="characters"
          />

          <TextField
            label="Account Number"
            value={accountNumber}
            onChangeText={text => setAccountNumber(text.replace(/\D/g, ''))}
            placeholder="1234567890"
            keyboardType="number-pad"
            maxLength={18}
          />

          <TextField
            label="Confirm Account Number"
            value={confirmAccount}
            onChangeText={text => setConfirmAccount(text.replace(/\D/g, ''))}
            placeholder="Re-enter account number"
            keyboardType="number-pad"
            maxLength={18}
          />

          <TextField
            label="IFSC Code"
            value={ifsc}
            onChangeText={text => setIfsc(text.toUpperCase())}
            placeholder="SBIN0000123"
            autoCapitalize="characters"
            maxLength={11}
          />

          {/* Tapping a bank fills the name field rather than storing a second
              value, which is what the design implies. */}
          <View style={styles.quickSelect}>
            <FieldLabel>Quick Select Bank</FieldLabel>

            <View style={styles.bankRow}>
              {QUICK_SELECT_BANKS.map(bank => {
                const isSelected = bank === bankName;

                return (
                  <Pressable
                    key={bank}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: isSelected }}
                    onPress={() => setBankName(bank)}
                    style={({ pressed }) => [
                      styles.bankChip,
                      isSelected && styles.bankChipSelected,
                      pressed && !isSelected && styles.pressed,
                    ]}
                  >
                    <Text
                      style={[
                        styles.bankLabel,
                        isSelected && styles.bankLabelSelected,
                      ]}
                    >
                      {bank}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {error !== null && <Text style={styles.error}>{error}</Text>}
        </ScrollView>
      </KeyboardAvoidingView>

      <WizardFooter
        label={submitting ? 'Submitting…' : 'Submit Application'}
        disabled={!isComplete || submitting}
        onPress={submit}
        onBack={onBack}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  body: {
    flex: 1,
  },
  content: {
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.section,
  },
  quickSelect: {
    padding: 14.755,
    borderRadius: radius.field,
    borderWidth: hairline,
    borderColor: colors.border.hairline,
    backgroundColor: colors.surface,
  },
  bankRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingTop: 10,
  },
  bankChip: {
    height: BANK_CHIP_HEIGHT,
    paddingHorizontal: 14.755,
    borderRadius: radius.chipSmall,
    borderWidth: hairline,
    borderColor: colors.border.hairline,
    backgroundColor: colors.surfaceInset,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bankChipSelected: {
    backgroundColor: colors.brandYellow,
    borderColor: colors.border.fieldActive,
  },
  pressed: {
    opacity: 0.6,
  },
  bankLabel: {
    ...typography.chipLabel,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  bankLabelSelected: {
    color: colors.text.ink,
  },
  error: {
    ...typography.caption,
    color: colors.status.danger,
    textAlign: 'center',
  },
});
