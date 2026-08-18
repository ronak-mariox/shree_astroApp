import React, { useState } from 'react';
import { ScrollView, StatusBar, StyleSheet, View } from 'react-native';

import { DOCUMENT_ICON_SIZE } from '../components/icons/DocumentIcons';
import { InfoCircleIcon } from '../components/icons/NoticeIcons';
import { InfoNote } from '../components/InfoNote';
import { UploadCounter, UploadRow } from '../components/UploadRow';
import { WizardFooter } from '../components/WizardFooter';
import { WizardHeader } from '../components/WizardHeader';
import { REGISTRATION_STEPS, REQUIRED_DOCUMENTS } from '../data/registration';
import { colors, radius, spacing } from '../theme';

type DocumentUploadScreenProps = {
  onBack?: () => void;
  onContinue?: (uploaded: string[]) => void;
};

/**
 * Step 3 of registration: the five documents that have to land before the
 * application can go in.
 * Figma: nodes 105:6300 (nothing uploaded) and 105:6452 (all five in).
 */
export function DocumentUploadScreen({
  onBack,
  onContinue,
}: DocumentUploadScreenProps) {
  const [uploaded, setUploaded] = useState<string[]>([]);

  const isComplete = uploaded.length === REQUIRED_DOCUMENTS.length;

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
          const isUploaded = uploaded.includes(document.id);

          return (
            <UploadRow
              key={document.id}
              title={document.title}
              hint={isUploaded ? 'Uploaded successfully' : document.hint}
              icon={<document.Icon size={DOCUMENT_ICON_SIZE} />}
              uploaded={isUploaded}
              onUpload={() =>
                setUploaded(current => [...current, document.id])
              }
            />
          );
        })}

        <UploadCounter
          uploaded={uploaded.length}
          total={REQUIRED_DOCUMENTS.length}
        />
      </ScrollView>

      <WizardFooter
        label="Continue →"
        disabled={!isComplete}
        onPress={() => onContinue?.(uploaded)}
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
});
