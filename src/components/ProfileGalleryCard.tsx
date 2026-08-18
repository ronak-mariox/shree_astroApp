import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { EditPencilIcon } from './icons/ProfileIcons';
import { colors, radius, spacing, typography } from '../theme';

/** Figma draws every thumbnail at 112.942 × 105.589 on a 9.388pt gutter. */
const THUMB_WIDTH = 112.942;
const THUMB_HEIGHT = 105.589;
const THUMB_GAP = 9.388;
const CHIP_HEIGHT = 27;
const PENCIL_SIZE = 18;

type ProfileGalleryCardProps = {
  title: string;
  /** How many thumbnails to lay out; all show the astrologer's own photo. */
  count: number;
  onEdit?: () => void;
  /**
   * `profile` is the read-only card on My Profile — a plain white panel with a
   * grey chip (node 110:6333). `edit` is its counterpart on the edit screen,
   * outlined and with an ink chip (node 110:7690).
   */
  variant?: 'profile' | 'edit';
};

/**
 * A gallery panel: a heading, an "Edit" chip on the right, and a row of
 * thumbnails beneath.
 */
export function ProfileGalleryCard({
  title,
  count,
  onEdit,
  variant = 'profile',
}: ProfileGalleryCardProps) {
  const edit = variant === 'edit';

  return (
    <View style={[styles.card, edit && styles.cardEdit]}>
      <View style={styles.headingRow}>
        <Text style={styles.heading}>{title}</Text>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Edit ${title}`}
          onPress={onEdit}
          style={({ pressed }) => [
            styles.chip,
            edit && styles.chipEdit,
            pressed && styles.pressed,
          ]}
        >
          <EditPencilIcon
            size={PENCIL_SIZE}
            color={edit ? colors.text.ink : colors.text.editAction}
          />
          <Text style={[styles.chipLabel, edit && styles.chipLabelEdit]}>
            Edit
          </Text>
        </Pressable>
      </View>

      <View style={styles.thumbs}>
        {Array.from({ length: count }, (_, index) => (
          <Image
            key={index}
            accessibilityLabel={`${title} photo ${index + 1}`}
            source={require('../assets/images/astrologer-avatar.jpg')}
            style={styles.thumb}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    height: 165,
    borderRadius: radius.input,
    backgroundColor: colors.surface,
  },
  cardEdit: {
    borderRadius: radius.mediaCard,
    borderWidth: 1,
    borderColor: colors.border.mediaCard,
  },
  headingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 10,
    paddingRight: 10.4,
    paddingTop: 10,
  },
  heading: {
    ...typography.profileSectionStrong,
    color: colors.text.slateMuted,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    height: CHIP_HEIGHT,
    paddingHorizontal: 7.6,
    borderRadius: radius.thumb,
    borderWidth: 1,
    borderColor: colors.border.editChip,
  },
  chipEdit: {
    borderColor: colors.text.ink,
  },
  chipLabel: {
    ...typography.profileEditLabel,
    color: colors.text.editAction,
  },
  chipLabelEdit: {
    color: colors.text.ink,
  },
  pressed: {
    opacity: 0.6,
  },
  thumbs: {
    flexDirection: 'row',
    gap: THUMB_GAP,
    paddingLeft: 10,
    paddingRight: 10.4,
    paddingTop: spacing.md,
  },
  /**
   * Three thumbnails at their designed width need the 402pt frame Figma drew
   * them on, so they shrink to fit a narrower screen; `aspectRatio` holds the
   * designed proportion while they do. A single thumbnail always fits and stays
   * at exactly 112.942 × 105.589.
   */
  thumb: {
    flexBasis: THUMB_WIDTH,
    flexShrink: 1,
    aspectRatio: THUMB_WIDTH / THUMB_HEIGHT,
    borderRadius: radius.thumb,
  },
});
