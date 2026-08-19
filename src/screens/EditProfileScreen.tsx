import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { BrandGradient } from '../components/BrandGradient';
import {
  CalendarIcon,
  CameraBadgeIcon,
  IndiaFlagIcon,
  NoRequestsIcon,
  SelectChevronIcon,
} from '../components/icons/ProfileIcons';
import { OptionPickerSheet } from '../components/OptionPickerSheet';
import { ProfileGalleryCard } from '../components/ProfileGalleryCard';
import { ProfileHeader } from '../components/ProfileHeader';
import {
  EDIT_GALLERIES,
  GENDER_OPTIONS,
  LANGUAGE_OPTIONS,
  SKILL_OPTIONS,
  type AstrologerProfile,
} from '../data/profile';
import { pickFile } from '../services/filePicker';
import { useAppData } from '../state/AppDataProvider';
import { colors, radius, spacing, typography } from '../theme';

const AVATAR_WIDTH = 69.548;
const AVATAR_HEIGHT = 66;
const ACTION_WIDTH = 70.602;
const ACTION_HEIGHT = 26;
const FIELD_HEIGHT = 40;
const DIAL_CHIP_WIDTH = 74.817;
const DIAL_CHIP_HEIGHT = 30;
/** Figma insets every field 10.54pt from the card's edge (node 110:7558). */
const CARD_GUTTER = 10.54;
/** The hairline Figma outlines a field with (node 110:7563). */
const FIELD_BORDER = 0.616;

/** Which select field has its picker open. */
type Picker = 'gender' | 'language' | 'skill' | null;

const PICKERS = {
  gender: { title: 'Gender', options: GENDER_OPTIONS, multiple: false },
  language: { title: 'Language', options: LANGUAGE_OPTIONS, multiple: false },
  skill: { title: 'Skill', options: SKILL_OPTIONS, multiple: true },
} as const;

type EditProfileScreenProps = {
  onBack?: () => void;
  /** Cancel and a successful Update both leave the form. */
  onClose?: () => void;
};

/**
 * The editable face of the astrologer's profile: the form over their details,
 * the two media galleries, and the panel where a pending details-change request
 * would land.
 * Figma: node 110:7463.
 */
export function EditProfileScreen({ onBack, onClose }: EditProfileScreenProps) {
  const { profile, saveProfile, changeProfilePhoto, error, clearError } =
    useAppData();
  /**
   * Unsaved edits, if any.
   *
   * The form is *derived* from the record rather than copied into state at
   * mount: `edits` is null until something is typed, and from then on it is the
   * whole form. Snapshotting instead would leave the fields blank whenever the
   * record has not arrived from the server yet.
   */
  const [edits, setEdits] = useState<AstrologerProfile | null>(null);
  const draft = edits ?? profile;
  const [picker, setPicker] = useState<Picker>(null);
  const [saving, setSaving] = useState(false);
  const [pickingPhoto, setPickingPhoto] = useState(false);

  const set = <K extends keyof AstrologerProfile>(
    key: K,
    value: AstrologerProfile[K],
  ) => setEdits(current => ({ ...(current ?? profile), [key]: value }));

  const changePhoto = async () => {
    setPickingPhoto(true);
    const file = await pickFile('photo');
    if (file) {
      await changeProfilePhoto(file);
      set('photoFileName', file.name);
    }
    setPickingPhoto(false);
  };

  const update = async () => {
    setSaving(true);
    const saved = await saveProfile(draft);
    setSaving(false);
    if (saved) {
      onClose?.();
    }
  };

  const cancel = () => {
    clearError();
    onClose?.();
  };

  const open = picker ? PICKERS[picker] : null;

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" />

      <ProfileHeader title="Edit Profile" onBack={onBack} />

      <KeyboardAvoidingView
        style={styles.fill}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.formCard}>
            <View style={styles.topRow}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Change profile photo"
                disabled={pickingPhoto}
                onPress={changePhoto}
                style={({ pressed }) => pressed && styles.pressed}
              >
                <Image
                  accessibilityLabel={draft.fullName}
                  source={require('../assets/images/astrologer-avatar.jpg')}
                  style={styles.avatar}
                />
                <View style={styles.cameraBadge}>
                  <CameraBadgeIcon />
                </View>
              </Pressable>

              <View style={styles.actions}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Cancel"
                  onPress={cancel}
                  style={({ pressed }) => [
                    styles.action,
                    styles.cancel,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={styles.cancelLabel}>Cancel</Text>
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Update"
                  disabled={saving}
                  onPress={update}
                  style={({ pressed }) => [
                    styles.action,
                    styles.update,
                    saving && styles.busy,
                    pressed && styles.pressed,
                  ]}
                >
                  <BrandGradient radius={radius.button} angle="shallow" />
                  {saving ? (
                    <ActivityIndicator
                      color={colors.text.inverse}
                      size="small"
                    />
                  ) : (
                    <Text style={styles.updateLabel}>Update</Text>
                  )}
                </Pressable>
              </View>
            </View>

            <Text style={styles.formTitle}>Edit Profile</Text>

            {draft.photoFileName && (
              <Text style={styles.notice}>
                New photo selected: {draft.photoFileName}
              </Text>
            )}

            {error && <Text style={styles.error}>{error}</Text>}

            <Field
              label="Full name"
              value={draft.fullName}
              onChangeText={next => set('fullName', next)}
              large
              focused
            />

            <Field
              label="E-mail"
              value={draft.email}
              onChangeText={next => set('email', next)}
              keyboardType="email-address"
            />

            <View style={styles.pair}>
              <SelectField
                label="Gender"
                value={draft.gender}
                chevron="right"
                onPress={() => setPicker('gender')}
                style={styles.pairItem}
              />
              {/* No date-picker library is installed, so DOB is typed and the
                  calendar mark is decorative for now. */}
              <View style={[styles.field, styles.pairItem]}>
                <Text style={styles.fieldLabel}>DOB</Text>
                <View style={styles.select}>
                  <TextInput
                    accessibilityLabel="DOB"
                    value={draft.dob}
                    onChangeText={next => set('dob', next)}
                    style={styles.selectInput}
                  />
                  <CalendarIcon />
                </View>
              </View>
            </View>

            <PhoneField
              label="Primary Mobile"
              value={draft.primaryMobile}
              onChangeText={next => set('primaryMobile', next)}
            />

            <PhoneField
              label="Secondary Mobile*"
              value={draft.secondaryMobile}
              onChangeText={next => set('secondaryMobile', next)}
            />

            <Field
              label="Exeperience"
              value={draft.experience}
              onChangeText={next => set('experience', next)}
            />

            <SelectField
              label="Skill*"
              value={draft.skill}
              chevron="down"
              onPress={() => setPicker('skill')}
            />

            <SelectField
              label="Language*"
              value={draft.language}
              chevron="down"
              onPress={() => setPicker('language')}
            />

            <Field
              label="About"
              value={draft.about}
              onChangeText={next => set('about', next)}
              multiline
            />
          </View>

          {/* The galleries are managed through the photo picker for now. */}
          {EDIT_GALLERIES.map(gallery => (
            <ProfileGalleryCard
              key={gallery.title}
              title={gallery.title}
              count={gallery.count}
              variant="edit"
              onEdit={changePhoto}
            />
          ))}

          <View style={styles.requestPanel}>
            <View style={styles.requestHeader}>
              <Text style={styles.requestTitle}>
                New Request For Details Change
              </Text>
            </View>

            <View style={styles.requestEmpty}>
              <NoRequestsIcon />
              <Text style={styles.requestEmptyLabel}>
                No change requests found
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {open && (
        <OptionPickerSheet
          visible
          title={open.title}
          options={open.options}
          value={
            picker === 'gender'
              ? draft.gender
              : picker === 'language'
              ? draft.language
              : draft.skill
          }
          multiple={open.multiple}
          onDismiss={() => setPicker(null)}
          onConfirm={value => {
            if (picker === 'gender') set('gender', value);
            else if (picker === 'language') set('language', value);
            else set('skill', value);
            setPicker(null);
          }}
        />
      )}
    </View>
  );
}

type FieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  /** The full-name field sets its value a size larger (node 110:7560). */
  large?: boolean;
  /** Figma draws one field with the ink outline that marks it focused. */
  focused?: boolean;
  multiline?: boolean;
  keyboardType?: 'default' | 'email-address';
};

/** A labelled text field on the edit form. */
function Field({
  label,
  value,
  onChangeText,
  large,
  focused,
  multiline,
  keyboardType = 'default',
}: FieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        keyboardType={keyboardType}
        style={[
          styles.input,
          large && styles.inputLarge,
          multiline && styles.inputMultiline,
          focused && styles.inputFocused,
        ]}
      />
    </View>
  );
}

type SelectFieldProps = {
  label: string;
  value: string;
  /** Figma points the chevron right on a picker and down on a list. */
  chevron?: 'right' | 'down';
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
};

/** A field whose value is chosen from a sheet rather than typed. */
function SelectField({
  label,
  value,
  chevron,
  onPress,
  style,
}: SelectFieldProps) {
  return (
    <View style={[styles.field, style]}>
      <Text style={styles.fieldLabel}>{label}</Text>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        onPress={onPress}
        style={({ pressed }) => [styles.select, pressed && styles.pressed]}
      >
        <Text style={styles.selectValue} numberOfLines={1}>
          {value}
        </Text>

        {chevron === 'right' ? (
          <View style={styles.chevronRight}>
            <SelectChevronIcon />
          </View>
        ) : (
          <SelectChevronIcon />
        )}
      </Pressable>
    </View>
  );
}

type PhoneFieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
};

/** A phone field: the dial-code chip sits inside the outlined field. */
function PhoneField({ label, value, onChangeText }: PhoneFieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>

      <View style={styles.phoneField}>
        <View style={styles.dialChip}>
          <IndiaFlagIcon />
          <Text style={styles.dialCode}>+91</Text>
          <View style={styles.chevronRight}>
            <SelectChevronIcon />
          </View>
        </View>

        <TextInput
          accessibilityLabel={label}
          value={value}
          onChangeText={onChangeText}
          keyboardType="number-pad"
          style={styles.phoneInput}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.canvasSoft,
  },
  fill: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 12,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  pressed: {
    opacity: 0.6,
  },
  busy: {
    opacity: 0.8,
  },
  formCard: {
    paddingHorizontal: CARD_GUTTER,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
    gap: spacing.section,
    borderRadius: radius.input,
    borderWidth: 1,
    // Figma drops the card's `karmaguru blue-400` outline to 20% (110:7556).
    borderColor: colors.border.historyCard,
    backgroundColor: colors.surface,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  avatar: {
    width: AVATAR_WIDTH,
    height: AVATAR_HEIGHT,
    borderRadius: radius.avatar,
  },
  // The badge straddles the avatar's bottom-right edge (node 110:7685).
  cameraBadge: {
    position: 'absolute',
    left: 48.47,
    top: 43,
  },
  actions: {
    flexDirection: 'row',
    gap: 9.4,
  },
  action: {
    width: ACTION_WIDTH,
    height: ACTION_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  cancel: {
    borderRadius: radius.thumb,
    borderWidth: 1,
    borderColor: colors.text.ink,
  },
  cancelLabel: {
    ...typography.profileButton,
    color: colors.text.ink,
  },
  update: {
    borderRadius: radius.button,
  },
  updateLabel: {
    ...typography.profileButton,
    color: colors.text.inverse,
  },
  formTitle: {
    ...typography.profileName,
    color: colors.text.slateMuted,
  },
  notice: {
    ...typography.editFieldLabel,
    color: colors.status.success,
  },
  error: {
    ...typography.editFieldLabel,
    color: colors.status.danger,
  },
  field: {
    gap: 6,
  },
  fieldLabel: {
    ...typography.editFieldLabel,
    color: colors.text.field,
    paddingLeft: 1.05,
  },
  input: {
    ...typography.editFieldValue,
    height: FIELD_HEIGHT,
    paddingHorizontal: CARD_GUTTER,
    paddingVertical: 0,
    borderRadius: radius.input,
    borderWidth: FIELD_BORDER,
    borderColor: colors.border.profileField,
    color: colors.text.field,
  },
  inputLarge: {
    ...typography.editFieldValueLarge,
  },
  inputFocused: {
    borderColor: colors.border.profileFieldActive,
  },
  inputMultiline: {
    ...typography.editFieldParagraph,
    height: 61,
    paddingTop: 9,
    borderRadius: radius.textArea,
    textAlignVertical: 'top',
  },
  pair: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  pairItem: {
    flex: 1,
  },
  select: {
    flexDirection: 'row',
    alignItems: 'center',
    height: FIELD_HEIGHT,
    paddingLeft: CARD_GUTTER,
    paddingRight: CARD_GUTTER,
    borderRadius: radius.input,
    borderWidth: FIELD_BORDER,
    borderColor: colors.border.profileField,
  },
  selectValue: {
    ...typography.editFieldValue,
    flex: 1,
    color: colors.text.field,
  },
  selectInput: {
    ...typography.editFieldValue,
    flex: 1,
    height: '100%',
    paddingVertical: 0,
    color: colors.text.field,
  },
  // The chevron is exported pointing down; a picker turns it to point right.
  chevronRight: {
    transform: [{ rotate: '-90deg' }],
  },
  phoneField: {
    flexDirection: 'row',
    alignItems: 'center',
    height: FIELD_HEIGHT,
    paddingLeft: 5.27,
    borderRadius: radius.input,
    borderWidth: FIELD_BORDER,
    borderColor: colors.border.profileField,
  },
  dialChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    width: DIAL_CHIP_WIDTH,
    height: DIAL_CHIP_HEIGHT,
    paddingHorizontal: 7.38,
    borderRadius: radius.dialChip,
    backgroundColor: colors.surfaceDialChip,
  },
  dialCode: {
    ...typography.editDialCode,
    color: colors.text.slateMuted,
  },
  phoneInput: {
    ...typography.editFieldValue,
    flex: 1,
    height: '100%',
    paddingHorizontal: spacing.section,
    paddingVertical: 0,
    color: colors.text.field,
  },
  requestPanel: {
    height: 195.712,
    borderRadius: radius.mediaCard,
    borderWidth: 1,
    borderColor: colors.border.mediaCard,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  requestHeader: {
    height: 38.507,
    justifyContent: 'center',
    paddingHorizontal: 10,
    backgroundColor: colors.brandYellow,
  },
  requestTitle: {
    ...typography.profileSectionStrong,
    color: colors.text.ink,
  },
  requestEmpty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    // Figma sets the whole empty state to 50% (node 110:7722).
    opacity: 0.5,
  },
  requestEmptyLabel: {
    ...typography.profileRowLabel,
    color: colors.text.slateMuted,
  },
});
