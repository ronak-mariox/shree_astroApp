import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { BankIntro } from '../components/BankIntro';
import { BrandGradient } from '../components/BrandGradient';
import { DocumentGroupCard } from '../components/DocumentGroupCard';
import { ProfileHeader } from '../components/ProfileHeader';
import { UploadDocumentSheet } from '../components/UploadDocumentSheet';
import { type UploadedDocument } from '../data/documents';
import { pickFile } from '../services/filePicker';
import { useAppData } from '../state/AppDataProvider';
import { colors, radius, spacing, typography } from '../theme';

const ADD_WIDTH = 166.67;
const ADD_HEIGHT = 34.65;

type DocumentsScreenProps = {
  onBack?: () => void;
};

/**
 * Every scan the astrologer has filed, grouped by what it proves, each with the
 * number and status it was filed against and the way to replace or drop it.
 * Figma: node 110:6999, with its upload sheet at 110:7414.
 */
export function DocumentsScreen({ onBack }: DocumentsScreenProps) {
  const {
    documentGroups,
    uploadDocument,
    replaceDocument,
    deleteDocument,
    error,
    clearError,
  } = useAppData();
  const [uploading, setUploading] = useState(false);
  /** The scan currently being replaced or removed, so its card can show it. */
  const [busyId, setBusyId] = useState<string | null>(null);

  const replace = async (document: UploadedDocument) => {
    setBusyId(document.id);
    const file = await pickFile('document');
    if (file) {
      await replaceDocument(document.id, file.name);
    }
    setBusyId(null);
  };

  const remove = async (document: UploadedDocument) => {
    setBusyId(document.id);
    await deleteDocument(document.id);
    setBusyId(null);
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" />

      <ProfileHeader title="Documents" onBack={onBack} />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Figma repeats the Bank Details brief here verbatim (node 110:7090). */}
        <BankIntro />

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Add Document"
          onPress={() => {
            clearError();
            setUploading(true);
          }}
          style={({ pressed }) => [styles.add, pressed && styles.pressed]}
        >
          <BrandGradient radius={radius.button} angle="shallow" />
          <Text style={styles.addLabel}>Add Document</Text>
        </Pressable>

        {documentGroups.length === 0 && (
          <Text style={styles.empty}>No documents on file yet.</Text>
        )}

        {documentGroups.map(group => (
          <DocumentGroupCard
            key={group.title}
            group={group}
            busyId={busyId}
            onUpdate={replace}
            onDelete={remove}
          />
        ))}
      </ScrollView>

      <UploadDocumentSheet
        visible={uploading}
        error={uploading ? error : null}
        onDismiss={() => {
          clearError();
          setUploading(false);
        }}
        onUpload={async upload => {
          const filed = await uploadDocument(upload);
          if (filed) {
            setUploading(false);
          }
          return filed;
        }}
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
  add: {
    alignSelf: 'center',
    width: ADD_WIDTH,
    height: ADD_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.button,
    overflow: 'hidden',
  },
  addLabel: {
    ...typography.historyAction,
    color: colors.text.inverse,
    textTransform: 'capitalize',
  },
  empty: {
    ...typography.profileRowLabel,
    color: colors.text.slateMuted,
    textAlign: 'center',
    opacity: 0.8,
  },
  pressed: {
    opacity: 0.6,
  },
});
