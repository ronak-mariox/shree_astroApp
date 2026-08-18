import React from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { BrandGradient } from '../components/BrandGradient';
import { ProfileGalleryCard } from '../components/ProfileGalleryCard';
import { ProfileHeader } from '../components/ProfileHeader';
import {
  PROFILE_GALLERY_COUNT,
  personalInformationOf,
  primaryMobileOf,
} from '../data/profile';
import { useAppData } from '../state/AppDataProvider';
import { colors, radius, spacing, typography } from '../theme';

const AVATAR_SIZE = 66;
const EDIT_WIDTH = 59;
const EDIT_HEIGHT = 26;

type MyProfileScreenProps = {
  onBack?: () => void;
  /** Both the gradient button and the gallery chip open the edit form. */
  onEdit?: () => void;
};

/**
 * The astrologer's own profile as it reads back to them: who they are, the
 * personal details on file, their blurb, and their photo gallery.
 * Figma: node 110:6288.
 */
export function MyProfileScreen({ onBack, onEdit }: MyProfileScreenProps) {
  const { profile } = useAppData();
  const rows = personalInformationOf(profile);

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" />

      <ProfileHeader title="My Profile" onBack={onBack} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.identity}>
          <Image
            accessibilityLabel={profile.fullName}
            source={require('../assets/images/astrologer-avatar.jpg')}
            style={styles.avatar}
          />

          <View style={styles.identityText}>
            <Text style={styles.name}>{profile.fullName}</Text>
            <Text style={styles.contact}>{profile.email}</Text>
            <Text style={styles.contact}>{primaryMobileOf(profile)}</Text>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Edit profile"
            onPress={onEdit}
            style={({ pressed }) => [
              styles.editButton,
              pressed && styles.pressed,
            ]}
          >
            <BrandGradient radius={radius.button} angle="shallow" />
            <Text style={styles.editLabel}>Edit</Text>
          </Pressable>
        </View>

        <View style={styles.panel}>
          <Text style={styles.sectionTitle}>Personal Information</Text>

          <View style={styles.rows}>
            {rows.map((row, index) => (
              <React.Fragment key={row.label}>
                {index > 0 && <View style={styles.rule} />}
                <View style={styles.row}>
                  <Text style={styles.rowLabel}>{row.label}</Text>
                  <Text style={styles.rowValue}>{row.value}</Text>
                </View>
              </React.Fragment>
            ))}
          </View>

          <Text style={[styles.sectionTitle, styles.aboutTitle]}>About Us</Text>
          <Text style={styles.about}>{profile.about}</Text>
        </View>

        {/* The galleries themselves are managed on the edit form. */}
        <ProfileGalleryCard
          title="Astrologer Profile Gallery"
          count={PROFILE_GALLERY_COUNT}
          onEdit={onEdit}
        />
      </ScrollView>
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
    paddingTop: 17,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  identity: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    height: 86,
    padding: 10,
    borderRadius: radius.input,
    backgroundColor: colors.surface,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: radius.avatar,
  },
  identityText: {
    flex: 1,
    paddingLeft: 18,
    paddingTop: 6,
  },
  name: {
    ...typography.profileName,
    color: colors.text.slateMuted,
  },
  contact: {
    ...typography.profileContact,
    color: colors.text.contact,
  },
  pressed: {
    opacity: 0.6,
  },
  editButton: {
    width: EDIT_WIDTH,
    height: EDIT_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.button,
    overflow: 'hidden',
  },
  editLabel: {
    ...typography.profileButton,
    color: colors.text.inverse,
  },
  panel: {
    paddingTop: 12,
    paddingBottom: spacing.section,
    borderRadius: radius.input,
    backgroundColor: colors.surface,
  },
  sectionTitle: {
    ...typography.profileSection,
    color: colors.text.slateMuted,
    paddingHorizontal: 10,
  },
  rows: {
    paddingHorizontal: 10,
    paddingTop: 10,
    gap: spacing.section,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  rowLabel: {
    ...typography.profileRowLabel,
    color: colors.text.slateMuted,
  },
  rowValue: {
    ...typography.profileRowValue,
    flexShrink: 1,
    color: colors.text.slateMuted,
    textAlign: 'right',
  },
  // Figma rules the rows off with karmaguru blue-200 at 3% (node 110:6309).
  rule: {
    height: 1,
    backgroundColor: colors.border.profileRow,
  },
  aboutTitle: {
    paddingTop: spacing.lg,
  },
  about: {
    ...typography.profileRowLabel,
    color: colors.text.slateMuted,
    paddingHorizontal: 10,
    paddingTop: 2,
    textAlign: 'justify',
  },
});
