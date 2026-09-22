import React, { useState } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';

import { DOCUMENT_ICON_SIZE } from '../components/icons/DocumentIcons';
import { InfoCircleIcon } from '../components/icons/NoticeIcons';
import { InfoNote } from '../components/InfoNote';
import { UploadCounter, UploadRow } from '../components/UploadRow';
import { WizardFooter } from '../components/WizardFooter';
import { WizardHeader } from '../components/WizardHeader';
import { REGISTRATION_STEPS, REQUIRED_DOCUMENTS } from '../data/registration';
import { uploadDocument, uploadProfilePhoto } from '../services/api';
import { pickFile } from '../services/filePicker';
import { colors, radius, spacing, typography } from '../theme';

type DocumentUploadScreenProps = {
  onBack?: () => void;
  onContinue?: () => void;
};

/**
 * The backend files a document against a printed number (see
 * `AstrologerProfile.documents[].idNumber`), which is useful when it's on
 * hand but not worth a whole extra field in a five-document wizard step —
 * the scan itself is what actually gets checked. This is what stands in for
 * it: enough that the field is never blank, nothing the astrologer has to type.
 */
const NO_ID_NUMBER_GIVEN = 'Not provided at signup';

/**
 * Step 3 of registration: the five documents that have to land before the
 * application can go in. Tapping a row's upload button picks a file and
 * sends it straight away — no separate confirm step — and the row turns
 * green the instant that succeeds.
 * Figma: nodes 105:6300 (nothing uploaded) and 105:6452 (all five in).
 */
export function DocumentUploadScreen({
  onBack,
  onContinue,
}: DocumentUploadScreenProps) {
  const [uploaded, setUploaded] = useState<Record<string, boolean>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const uploadedCount = REQUIRED_DOCUMENTS.filter(document => uploaded[document.id]).length;
  const isComplete = uploadedCount === REQUIRED_DOCUMENTS.length;

  /** Picks a file and, the moment one comes back, uploads it — one tap, done. */
  const choose = async (id: string) => {
    const document = REQUIRED_DOCUMENTS.find(entry => entry.id === id);
    if (!document || busyId) {
      return;
    }

    const picked = await pickFile(id === 'photo' ? 'photo' : 'document');
    if (!picked) {
      return;
    }

    setBusyId(id);
    setError(null);

    try {
      if (document.backendType) {
        await uploadDocument({
          type: document.backendType,
          idNumber: NO_ID_NUMBER_GIVEN,
          file: picked,
        });
      } else {
        /** The profile photo isn't a "document" on the backend — it sets the account's own photo. */
        await uploadProfilePhoto(picked);
      }
      setUploaded(current => ({ ...current, [id]: true }));
    } catch (caught) {
      setError(
        (caught as Error)?.message ?? 'Something went wrong. Please try again.',
      );
    } finally {
      setBusyId(null);
    }
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" />

      <WizardHeader
        step={3}
        totalSteps={REGISTRATION_STEPS}
        title="Document Upload"
        onBack={onBack}
      />

      <ScrollView style={styles.body} contentContainerStyle={styles.content}>
        <InfoNote
          tone="info"
          cornerRadius={radius.input}
          icon={<InfoCircleIcon />}
        >
          Upload clear, readable images. All documents are encrypted and stored
          securely.
        </InfoNote>

        {REQUIRED_DOCUMENTS.map(document => {
          const isUploaded = Boolean(uploaded[document.id]);
          const isBusy = busyId === document.id;

          return (
            <UploadRow
              key={document.id}
              title={document.title}
              hint={
                isBusy
                  ? 'Uploading…'
                  : isUploaded
                  ? 'Uploaded successfully'
                  : document.hint
              }
              icon={<document.Icon size={DOCUMENT_ICON_SIZE} />}
              status={isUploaded ? 'done' : 'idle'}
              busy={isBusy}
              onUpload={() => choose(document.id)}
            />
          );
        })}

        {error !== null && <Text style={styles.error}>{error}</Text>}

        <UploadCounter
          uploaded={uploadedCount}
          total={REQUIRED_DOCUMENTS.length}
        />
      </ScrollView>

      <WizardFooter
        label="Continue →"
        disabled={!isComplete}
        onPress={onContinue}
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
    gap: spacing.md,
  },
  error: {
    ...typography.caption,
    color: colors.status.danger,
    textAlign: 'center',
  },
});
