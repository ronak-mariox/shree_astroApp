import React, { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { BottomSheet } from './BottomSheet';
import { BrandGradient } from './BrandGradient';
import { UploadCloudIcon } from './icons/BankIcons';
import {
  BANK_ACCOUNT_FIELDS,
  EMPTY_BANK_ACCOUNT,
  type BankAccountDraft,
} from '../data/bank';
import { pickFile, type PickedFile } from '../services/filePicker';
import { colors, radius, spacing, typography } from '../theme';

const FIELD_HEIGHT = 32.289;
const ACTION_HEIGHT = 34.65;
const DROP_ZONE_HEIGHT = 62;

type AddBankAccountSheetProps = {
  visible: boolean;
  onDismiss: () => void;
  /** Resolves true once the account is on file, so the sheet knows to close. */
  onSubmit: (
    draft: BankAccountDraft,
    proof?: PickedFile,
  ) => Promise<boolean>;
  /** The last refusal from the server, shown above the buttons. */
  error?: string | null;
};

/**
 * The sheet behind "+ Add Other Bank Account": five fields, a drop zone for the
 * account proof, and the pair that settles it.
 * Figma: node 110:6793.
 */
export function AddBankAccountSheet({
  visible,
  onDismiss,
  onSubmit,
  error,
}: AddBankAccountSheetProps) {
  const [draft, setDraft] = useState<BankAccountDraft>(EMPTY_BANK_ACCOUNT);
  const [proof, setProof] = useState<PickedFile | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setDraft(EMPTY_BANK_ACCOUNT);
    setProof(null);
  };

  const close = () => {
    reset();
    onDismiss();
  };

  const browse = async () => {
    const file = await pickFile('proof');
    if (file) {
      setProof(file);
    }
  };

  const submit = async () => {
    setSubmitting(true);
    const filed = await onSubmit(draft, proof ?? undefined);
    setSubmitting(false);
    if (filed) {
      reset();
    }
  };

  return (
    <BottomSheet visible={visible} title="Add New Account" onDismiss={close}>
      <ScrollView
        contentContainerStyle={styles.body}
        keyboardShouldPersistTaps="handled"
      >
        {BANK_ACCOUNT_FIELDS.map(field => (
          <View key={field.key} style={styles.field}>
            <Text style={styles.label}>{field.label}</Text>
            <TextInput
              accessibilityLabel={field.label}
              value={draft[field.key]}
              onChangeText={next =>
                setDraft(current => ({ ...current, [field.key]: next }))
              }
              placeholder={field.placeholder}
              placeholderTextColor={colors.text.slateMuted}
              style={styles.input}
            />
          </View>
        ))}

        <View style={styles.field}>
          <Text style={styles.label}>Account Proof *</Text>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Upload account proof"
            onPress={browse}
            style={({ pressed }) => [styles.dropZone, pressed && styles.pressed]}
          >
            <UploadCloudIcon />
            <View style={styles.dropZoneText}>
              {proof ? (
                <Text style={styles.uploadCopy} numberOfLines={1}>
                  {proof.name}
                </Text>
              ) : (
                <View style={styles.dropZoneLine}>
                  <Text style={styles.uploadCopy}>Upload your file(s) or</Text>
                  <Text style={styles.uploadLink}> browse</Text>
                </View>
              )}
              <Text style={styles.uploadCopy}>
                {proof ? 'Tap to replace' : 'Max 5 MB files are allowed'}
              </Text>
            </View>
          </Pressable>
        </View>

        {error && <Text style={styles.error}>{error}</Text>}

        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close"
            onPress={close}
            style={({ pressed }) => [
              styles.action,
              styles.close,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.closeLabel}>Close</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Submit"
            disabled={submitting}
            onPress={submit}
            style={({ pressed }) => [
              styles.action,
              styles.submit,
              submitting && styles.busy,
              pressed && styles.pressed,
            ]}
          >
            <BrandGradient radius={radius.button} angle="shallow" />
            {submitting ? (
              <ActivityIndicator color={colors.text.inverse} size="small" />
            ) : (
              <Text style={styles.submitLabel}>Submit</Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  body: {
    paddingHorizontal: 8.73,
    paddingTop: 11.6,
    paddingBottom: spacing.lg,
    gap: 15,
  },
  field: {
    gap: 5,
  },
  label: {
    ...typography.menuMeta,
    color: colors.text.slateMuted,
    paddingLeft: 2.22,
  },
  input: {
    ...typography.menuMeta,
    height: FIELD_HEIGHT,
    paddingHorizontal: 10,
    paddingVertical: 0,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.border.sheetField,
    color: colors.text.slateMuted,
  },
  dropZone: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    height: DROP_ZONE_HEIGHT,
    borderRadius: radius.mediaCard,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border.dropZone,
  },
  dropZoneText: {
    alignItems: 'center',
    width: 200,
  },
  dropZoneLine: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  uploadCopy: {
    ...typography.uploadCopy,
    color: colors.text.slateMuted,
    textAlign: 'center',
  },
  uploadLink: {
    ...typography.uploadLink,
    color: colors.text.slateMuted,
  },
  error: {
    ...typography.menuMeta,
    color: colors.status.danger,
    paddingLeft: 2.22,
  },
  pressed: {
    opacity: 0.6,
  },
  busy: {
    opacity: 0.8,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: 20.5,
    paddingTop: 12.6,
  },
  action: {
    flex: 1,
    height: ACTION_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  close: {
    borderRadius: radius.thumb,
    borderWidth: 1,
    borderColor: colors.brandOrange,
  },
  closeLabel: {
    ...typography.historyAction,
    color: colors.brandOrange,
    textTransform: 'capitalize',
  },
  submit: {
    borderRadius: radius.button,
  },
  submitLabel: {
    ...typography.historyAction,
    color: colors.text.inverse,
    textTransform: 'capitalize',
  },
});
