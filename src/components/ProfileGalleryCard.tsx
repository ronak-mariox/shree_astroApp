import React from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { EditPencilIcon } from './icons/ProfileIcons';
import { type GalleryPhoto } from '../data/gallery';
import { colors, radius, spacing, typography } from '../theme';

/** Figma draws every thumbnail at 112.942 × 105.589 on a 9.388pt gutter. */
const THUMB_WIDTH = 112.942;
const THUMB_HEIGHT = 105.589;
const THUMB_GAP = 9.388;
const CHIP_HEIGHT = 27;
const PENCIL_SIZE = 18;
const REMOVE_BADGE_SIZE = 20;

type ProfileGalleryCardProps = {
  title: string;
  /** The astrologer's own portfolio photos — separate from their single profile photo. */
  photos: ReadonlyArray<GalleryPhoto>;
  /**
   * `profile` (read-only, My Profile) reads this as "open the edit form".
   * `edit` (Edit Profile) reads it as "pick and upload a new photo".
   */
  onEdit?: () => void;
  /** `edit` variant only: removes one uploaded photo. */
  onRemove?: (id: string) => void;
  /** `edit` variant only: shows a spinner on the chip while an upload is in flight. */
  busy?: boolean;
  /**
   * `profile` is the read-only card on My Profile — a plain white panel with a
   * grey chip (node 110:6333). `edit` is its counterpart on the edit screen,
   * outlined and with an ink chip (node 110:7690).
   */
  variant?: 'profile' | 'edit';
};

/**
 * A gallery panel: a heading, an Edit/Add chip on the right, and a scrolling
 * row of the astrologer's own uploaded photos beneath — empty until they add
 * their first one.
 */
export function ProfileGalleryCard({
  title,
  photos,
  onEdit,
  onRemove,
  busy,
  variant = 'profile',
}: ProfileGalleryCardProps) {
  const edit = variant === 'edit';

  return (
    <View style={[styles.card, edit && styles.cardEdit]}>
      <View style={styles.headingRow}>
        <Text style={styles.heading}>{title}</Text>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={edit ? `Add to ${title}` : `Edit ${title}`}
          disabled={busy}
          onPress={onEdit}
          style={({ pressed }) => [
            styles.chip,
            edit && styles.chipEdit,
            pressed && styles.pressed,
          ]}
        >
          {busy ? (
            <ActivityIndicator
              size="small"
              color={edit ? colors.text.ink : colors.text.editAction}
            />
          ) : (
            <EditPencilIcon
              size={PENCIL_SIZE}
              color={edit ? colors.text.ink : colors.text.editAction}
            />
          )}
          <Text style={[styles.chipLabel, edit && styles.chipLabelEdit]}>
            {edit ? 'Add' : 'Edit'}
          </Text>
        </Pressable>
      </View>

      {photos.length === 0 ? (
        <Text style={styles.empty}>
          {edit
            ? 'No photos yet — tap Add to upload one.'
            : 'No photos added yet.'}
        </Text>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.thumbs}
        >
          {photos.map(photo => (
            <View key={photo.id} style={styles.thumbWrap}>
              <Image
                accessibilityLabel={`${title} photo`}
                source={{ uri: photo.url }}
                style={styles.thumb}
              />
              {edit && onRemove && (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Remove photo"
                  onPress={() => onRemove(photo.id)}
                  style={({ pressed }) => [
                    styles.removeBadge,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={styles.removeGlyph}>×</Text>
                </Pressable>
              )}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 165,
    borderRadius: radius.input,
    backgroundColor: colors.surface,
    paddingBottom: spacing.md,
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
  empty: {
    ...typography.profileRowLabel,
    color: colors.text.slateMuted,
    opacity: 0.6,
    paddingHorizontal: 10,
    paddingTop: spacing.lg,
  },
  thumbs: {
    flexDirection: 'row',
    gap: THUMB_GAP,
    paddingLeft: 10,
    paddingRight: 10.4,
    paddingTop: spacing.md,
  },
  thumbWrap: {
    width: THUMB_WIDTH,
    height: THUMB_HEIGHT,
  },
  /**
   * Three thumbnails at their designed width need the 402pt frame Figma drew
   * them on; a scrolling row holds them at their fixed designed size instead
   * of shrinking to fit, since the row can now run to any length.
   */
  thumb: {
    width: THUMB_WIDTH,
    height: THUMB_HEIGHT,
    borderRadius: radius.thumb,
  },
  removeBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: REMOVE_BADGE_SIZE,
    height: REMOVE_BADGE_SIZE,
    borderRadius: REMOVE_BADGE_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  removeGlyph: {
    color: colors.text.inverse,
    fontSize: 14,
    lineHeight: 16,
    fontWeight: '700',
  },
});
