import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';

import { OptionGroup } from '../components/OptionGroup';
import { PhoneField } from '../components/PhoneField';
import { TextField } from '../components/TextField';
import { WizardFooter } from '../components/WizardFooter';
import { WizardHeader } from '../components/WizardHeader';
import { GENDER_OPTIONS, REGISTRATION_STEPS } from '../data/registration';
import { colors, spacing } from '../theme';

const MOBILE_LENGTH = 10;

export type PersonalInfo = {
  fullName: string;
  mobile: string;
  dateOfBirth: string;
  gender: string;
};

type PersonalInfoScreenProps = {
  onBack?: () => void;
  onContinue?: (info: PersonalInfo) => void;
};

/** Punctuates a run of digits as DD/MM/YYYY while it is being typed. */
const formatDateOfBirth = (input: string) => {
  const digits = input.replace(/\D/g, '').slice(0, 8);
  const parts = [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4)];
  return parts.filter(part => part.length > 0).join('/');
};

/**
 * Step 1 of registration: who the astrologer is.
 * Figma: nodes 105:6016 (empty) and 105:6090 (filled).
 */
export function PersonalInfoScreen({
  onBack,
  onContinue,
}: PersonalInfoScreenProps) {
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState<string | null>(null);

  const isComplete =
    fullName.trim().length > 0 &&
    mobile.length === MOBILE_LENGTH &&
    dateOfBirth.length === 10 &&
    gender !== null;

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" />

      <WizardHeader
        step={1}
        totalSteps={REGISTRATION_STEPS}
        title="Personal Info"
        onBack={onBack}
      />

      <KeyboardAvoidingView
        behavior="padding"
        style={styles.body}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <TextField
            label="Full Name"
            value={fullName}
            onChangeText={setFullName}
            placeholder="Pt. Rajesh Sharma"
            autoCapitalize="words"
          />

          <PhoneField
            label="Mobile Number"
            value={mobile}
            onChangeText={text => setMobile(text.replace(/\D/g, ''))}
            placeholder="10-digit number"
            maxLength={MOBILE_LENGTH}
            variant="compact"
          />

          <TextField
            label="Date of Birth"
            value={dateOfBirth}
            onChangeText={text => setDateOfBirth(formatDateOfBirth(text))}
            placeholder="DD/MM/YYYY"
            keyboardType="number-pad"
            maxLength={10}
          />

          <OptionGroup
            label="Gender"
            options={GENDER_OPTIONS}
            selected={gender}
            onSelect={setGender}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      <WizardFooter
        label="Continue →"
        disabled={!isComplete}
        onPress={() =>
          onContinue?.({
            fullName,
            mobile,
            dateOfBirth,
            gender: gender ?? '',
          })
        }
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
    gap: spacing.section,
  },
});
