import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
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
  onBack?: () => void;
  onSubmit?: (details: BankDetails) => void;
};

/**
 * Step 4 of registration: where the earnings land. The account number has to be
 * keyed twice and the two have to agree before the application can go in.
 * Figma: node 105:6583.
 */
export function BankDetailsScreen({
  onBack,
  onSubmit,
}: BankDetailsScreenProps) {
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [confirmAccount, setConfirmAccount] = useState('');
  const [ifsc, setIfsc] = useState('');

  const isComplete =
    bankName.trim().length > 0 &&
    accountNumber.length > 0 &&
    confirmAccount === accountNumber &&
    ifsc.trim().length > 0;

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
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
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
        </ScrollView>
      </KeyboardAvoidingView>

      <WizardFooter
        label="Submit Application"
        disabled={!isComplete}
        onPress={() => onSubmit?.({ bankName, accountNumber, ifsc })}
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
});
