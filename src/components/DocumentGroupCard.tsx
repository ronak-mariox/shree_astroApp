import React from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { DocumentBinIcon } from './icons/DocumentFlowIcons';
import { type DocumentGroup, type UploadedDocument } from '../data/documents';
import { colors, radius, spacing, typography } from '../theme';

/** Figma frames every scan at 356.972 × 184.637 (node 110:7108). */
const SCAN_WIDTH = 356.972;
const SCAN_HEIGHT = 184.637;
const UPDATE_WIDTH = 67.062;
const BIN_WIDTH = 33.458;
const ACTION_HEIGHT = 30.461;
/** Where Figma seats the action pair inside the scan (node 110:7109). */
const ACTION_TOP = 7.19;
const ACTION_RIGHT = 5.844;
const ACTION_GAP = 5.078;

type DocumentGroupCardProps = {
  group: DocumentGroup;
  /** The scan currently being replaced or removed, if any. */
  busyId?: string | null;
  onUpdate?: (document: UploadedDocument) => void;
  onDelete?: (document: UploadedDocument) => void;
};

/**
 * One heading and the scans filed under it, each carrying its own Update and
 * delete buttons and the number and status it was filed against.
 * Figma: nodes 110:7102, 110:7154 and 110:7180.
 */
export function DocumentGroupCard({
  group,
  busyId,
  onUpdate,
  onDelete,
}: DocumentGroupCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{group.title}</Text>

      {group.documents.map((document, index) => {
        const busy = busyId === document.id;

        return (
          <React.Fragment key={document.id}>
            {index > 0 && <View style={styles.rule} />}

            <View>
              <View style={styles.scanFrame}>
                <Image
                  accessibilityLabel={`${group.title} scan ${index + 1}`}
                  source={require('../assets/images/bank-attachment.png')}
                  // Figma crops the scan into its frame rather than letterboxing.
                  resizeMode="cover"
                  style={styles.scan}
                />

                <View style={styles.actions}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Update ${group.title} ${index + 1}`}
                    disabled={busy}
                    onPress={() => onUpdate?.(document)}
                    style={({ pressed }) => [
                      styles.update,
                      busy && styles.busy,
                      pressed && styles.pressed,
                    ]}
                  >
                    {busy ? (
                      <ActivityIndicator color={colors.text.ink} size="small" />
                    ) : (
                      <Text style={styles.updateLabel}>Update</Text>
                    )}
                  </Pressable>

                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Delete ${group.title} ${index + 1}`}
                    disabled={busy}
                    onPress={() => onDelete?.(document)}
                    style={({ pressed }) => [
                      styles.bin,
                      busy && styles.busy,
                      pressed && styles.pressed,
                    ]}
                  >
                    <DocumentBinIcon />
                  </Pressable>
                </View>
              </View>

              <View style={styles.meta}>
                <Text style={styles.metaLabel}>
                  ID Number :{' '}
                  <Text style={styles.metaValue}>{document.idNumber}</Text>
                </Text>
                <Text style={styles.metaLabel}>
                  Status :{' '}
                  <Text style={[styles.metaValue, styles.metaStatus]}>
                    {document.status}
                  </Text>
                </Text>
              </View>
            </View>
          </React.Fragment>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingHorizontal: 10,
    paddingTop: 5,
    paddingBottom: 10,
    gap: spacing.sm,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.border.documentCard,
    backgroundColor: colors.surface,
  },
  title: {
    ...typography.documentGroupTitle,
    color: colors.text.slateMuted,
  },
  /**
   * The scan is drawn at its designed width on Figma's 402pt frame; on a
   * narrower screen it shrinks and `aspectRatio` holds the proportion, which
   * keeps the action pair pinned to the same corner either way.
   */
  scanFrame: {
    width: '100%',
    maxWidth: SCAN_WIDTH,
    aspectRatio: SCAN_WIDTH / SCAN_HEIGHT,
  },
  scan: {
    width: '100%',
    height: '100%',
    borderRadius: radius.attachment,
  },
  actions: {
    position: 'absolute',
    top: ACTION_TOP,
    right: ACTION_RIGHT,
    flexDirection: 'row',
    gap: ACTION_GAP,
  },
  update: {
    width: UPDATE_WIDTH,
    height: ACTION_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.documentAction,
    borderWidth: 1,
    borderColor: colors.text.ink,
    backgroundColor: colors.surfaceGlass,
  },
  updateLabel: {
    ...typography.bankHeading,
    color: colors.text.ink,
    textTransform: 'capitalize',
  },
  bin: {
    width: BIN_WIDTH,
    height: ACTION_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.documentBin,
    backgroundColor: colors.history.block,
  },
  pressed: {
    opacity: 0.6,
  },
  busy: {
    opacity: 0.7,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 5.84,
    paddingTop: 5.6,
  },
  metaLabel: {
    ...typography.documentMetaLabel,
    color: colors.text.slateMuted,
  },
  metaValue: {
    ...typography.documentMetaValue,
    color: colors.text.slateMuted,
  },
  metaStatus: {
    color: colors.text.statusPending,
  },
  // Figma rules two scans apart with a 3.586pt band at 10% (node 110:7129).
  rule: {
    height: 3.586,
    backgroundColor: colors.surfaceDocumentRule,
  },
});
