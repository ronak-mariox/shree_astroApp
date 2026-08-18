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
import {
  RadioMark,
  UploadCloudSmallIcon,
} from './icons/DocumentFlowIcons';
import { DEFAULT_DOCUMENT_TYPE, DOCUMENT_TYPES } from '../data/documents';
import { pickFile } from '../services/filePicker';
import { colors, radius, spacing, typography } from '../theme';

const CHIP_HEIGHT = 32.699;
const CHIP_GAP_X = 16.36;
const CHIP_GAP_Y = 5.42;
const DROP_ZONE_HEIGHT = 90;
const FIELD_HEIGHT = 32.699;
const ACTION_HEIGHT = 34.65;

export type DocumentUpload = {
  type: string;
  idNumber: string;
  fileName: string;
};

type UploadDocumentSheetProps = {
  visible: boolean;
  onDismiss: () => void;
  /** Resolves true once the scan is on file, so the sheet knows to close. */
  onUpload: (upload: DocumentUpload) => Promise<boolean>;
  /** The last refusal from the server, shown above the buttons. */
  error?: string | null;
};

/**
 * The sheet behind "Add Document": which kind of document this is, the file
 * itself, and the number it is filed against.
 * Figma: node 110:7414.
 */
export function UploadDocumentSheet({
  visible,
  onDismiss,
  onUpload,
  error,
}: UploadDocumentSheetProps) {
  const [type, setType] = useState(DEFAULT_DOCUMENT_TYPE);
  const [idNumber, setIdNumber] = useState('');
  const [file, setFile] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const reset = () => {
    setType(DEFAULT_DOCUMENT_TYPE);
    setIdNumber('');
    setFile(null);
  };

  const close = () => {
    reset();
    onDismiss();
  };

  const browse = async () => {
    const picked = await pickFile('document');
    if (picked) {
      setFile(picked.name);
    }
  };

  const upload = async () => {
    setUploading(true);
    const filed = await onUpload({ type, idNumber, fileName: file ?? '' });
    setUploading(false);
    if (filed) {
      reset();
    }
  };

  return (
    <BottomSheet
      visible={visible}
      title="Upload documents here"
      onDismiss={close}
    >
      <ScrollView
        contentContainerStyle={styles.body}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.label}>Select Document Type *</Text>

        {/* Figma fills the left column first, so the types pair off in the
            order they are listed. */}
        <View style={styles.chips}>
          {DOCUMENT_TYPES.map(option => {
            const selected = option === type;
            return (
              <Pressable
                key={option}
                accessibilityRole="radio"
                accessibilityLabel={option}
                accessibilityState={{ selected }}
                onPress={() => setType(option)}
                style={({ pressed }) => [
                  styles.chip,
                  selected ? styles.chipSelected : styles.chipIdle,
                  pressed && styles.pressed,
                ]}
              >
                <RadioMark selected={selected} />
                <Text
                  style={selected ? styles.chipLabelSelected : styles.chipLabel}
                  numberOfLines={1}
                >
                  {option}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.bottomRow}>
          <View style={styles.bottomColumn}>
            <Text style={styles.label}>Upload Document</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Upload your file"
              onPress={browse}
              style={({ pressed }) => [
                styles.dropZone,
                pressed && styles.pressed,
              ]}
            >
              <UploadCloudSmallIcon />
              <Text style={styles.dropZoneCopy} numberOfLines={1}>
                {file ?? 'Upload your file'}
              </Text>
              <Text style={[styles.dropZoneCopy, styles.dropZoneHint]}>
                {file ? 'Tap to replace' : 'Max 5 MB files are allowed'}
              </Text>
            </Pressable>
          </View>

          <View style={styles.bottomColumn}>
            <Text style={styles.label}>ID Proof No*</Text>
            <TextInput
              accessibilityLabel="ID Proof No*"
              value={idNumber}
              onChangeText={setIdNumber}
              placeholder="Type...."
              placeholderTextColor={colors.text.placeholderFaint}
              style={styles.field}
            />
          </View>
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
            accessibilityLabel="Upload"
            disabled={uploading}
            onPress={upload}
            style={({ pressed }) => [
              styles.action,
              styles.upload,
              uploading && styles.busy,
              pressed && styles.pressed,
            ]}
          >
            <BrandGradient radius={radius.button} angle="shallow" />
            {uploading ? (
              <ActivityIndicator color={colors.text.inverse} size="small" />
            ) : (
              <Text style={styles.uploadLabel}>Upload</Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  body: {
    paddingHorizontal: 10.86,
    paddingTop: 10.6,
    paddingBottom: spacing.lg,
    gap: 10,
  },
  label: {
    ...typography.menuMeta,
    color: colors.text.slateMuted,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: CHIP_GAP_X,
    rowGap: CHIP_GAP_Y,
  },
  chip: {
    // Two to a row, sharing the gap between them.
    width: `48%`,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7.53,
    height: CHIP_HEIGHT,
    paddingHorizontal: 8.06,
    borderRadius: radius.thumb,
  },
  chipIdle: {
    borderWidth: 1,
    borderColor: colors.border.optionChip,
  },
  chipSelected: {
    backgroundColor: colors.brandYellow,
  },
  chipLabel: {
    ...typography.menuMeta,
    flexShrink: 1,
    color: colors.text.slateMuted,
  },
  chipLabelSelected: {
    ...typography.optionChipSelected,
    flexShrink: 1,
    color: colors.text.ink,
  },
  pressed: {
    opacity: 0.6,
  },
  busy: {
    opacity: 0.8,
  },
  error: {
    ...typography.menuMeta,
    color: colors.status.danger,
  },
  bottomRow: {
    flexDirection: 'row',
    gap: CHIP_GAP_X,
    paddingTop: 6,
  },
  bottomColumn: {
    flex: 1,
    gap: 6,
  },
  dropZone: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    height: DROP_ZONE_HEIGHT,
    borderRadius: radius.mediaCard,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.text.slateMuted,
  },
  dropZoneCopy: {
    ...typography.uploadHint,
    color: colors.text.slateMuted,
    textAlign: 'center',
  },
  dropZoneHint: {
    color: colors.text.uploadHint,
  },
  field: {
    ...typography.menuMeta,
    height: FIELD_HEIGHT,
    paddingHorizontal: 8.34,
    paddingVertical: 0,
    borderRadius: radius.thumb,
    borderWidth: 1,
    borderColor: colors.border.uploadField,
    color: colors.text.slateMuted,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: 18.3,
    paddingTop: 19.7,
  },
  action: {
    flex: 1,
    height: ACTION_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  close: {
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.border.strong,
  },
  closeLabel: {
    ...typography.historyAction,
    color: colors.border.strong,
    textTransform: 'capitalize',
  },
  upload: {
    borderRadius: radius.button,
  },
  uploadLabel: {
    ...typography.historyAction,
    color: colors.text.inverse,
    textTransform: 'capitalize',
  },
});
