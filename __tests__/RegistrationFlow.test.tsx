import React from 'react';
import { TextInput } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ChipGroup } from '../src/components/ChipGroup';
import { OptionGroup } from '../src/components/OptionGroup';
import { PhoneField } from '../src/components/PhoneField';
import { PrimaryButton } from '../src/components/PrimaryButton';
import { TextField } from '../src/components/TextField';
import { UploadRow } from '../src/components/UploadRow';
import { WizardHeader } from '../src/components/WizardHeader';
import {
  REQUIRED_DOCUMENTS,
  REVIEW_STAGES,
  SPECIALIZATIONS,
} from '../src/data/registration';
import { ApplicationSubmittedScreen } from '../src/screens/ApplicationSubmittedScreen';
import { BankDetailsScreen } from '../src/screens/BankDetailsScreen';
import { DocumentUploadScreen } from '../src/screens/DocumentUploadScreen';
import { PersonalInfoScreen } from '../src/screens/PersonalInfoScreen';
import { ProfessionalDetailsScreen } from '../src/screens/ProfessionalDetailsScreen';
import * as api from '../src/services/api';
import { register } from '../src/services/auth';

const METRICS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

/** Concatenated visible text — the screens draw a lot of SVG the JSON dump
 *  would otherwise drown the assertions in. */
const textOf = (tree: ReactTestRenderer.ReactTestRenderer): string => {
  const walk = (node: any): string => {
    if (node === null || node === undefined) return '';
    if (typeof node === 'string') return node;
    if (Array.isArray(node)) return node.map(walk).join('');
    if (typeof node === 'object') return walk(node.children);
    return '';
  };
  return walk(tree.toJSON());
};

const mounted: ReactTestRenderer.ReactTestRenderer[] = [];

const render = async (element: React.ReactElement) => {
  let tree!: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(
      <SafeAreaProvider initialMetrics={METRICS}>{element}</SafeAreaProvider>,
    );
  });
  mounted.push(tree);
  return tree;
};

afterEach(async () => {
  await ReactTestRenderer.act(() => {
    mounted.splice(0).forEach(tree => tree.unmount());
  });
});

const act = ReactTestRenderer.act;

/**
 * The pressable behind each control. Pressable puts `accessibilityRole` on both
 * its composite and its host node, but only the composite carries `onPress`.
 */
const pressablesWithRole = (
  node: ReactTestRenderer.ReactTestInstance,
  role: string,
) =>
  node.findAll(
    child =>
      child.props.accessibilityRole === role &&
      typeof child.props.onPress === 'function',
  );

test('step 1 arms Continue only when every field is answered', async () => {
  const onContinue = jest.fn();
  const tree = await render(<PersonalInfoScreen onContinue={onContinue} />);

  const text = textOf(tree);
  expect(text).toContain('Step 1 of 4');
  expect(text).toContain('Personal Info');
  expect(text).toContain('Full Name');
  expect(text).toContain('Date of Birth');
  expect(text).toContain('Gender');

  const header = tree.root.findByType(WizardHeader);
  expect(header.props.step).toBe(1);

  const cta = () => tree.root.findByType(PrimaryButton);
  const fields = () => tree.root.findAllByType(TextField);
  expect(cta().props.disabled).toBe(true);

  await act(() => {
    fields()[0].findByType(TextInput).props.onChangeText('Pt. Rajesh Sharma');
  });
  await act(() => {
    tree.root
      .findByType(PhoneField)
      .findByType(TextInput)
      .props.onChangeText('9876543210');
  });
  // Digits are punctuated into DD/MM/YYYY as they are typed.
  await act(() => {
    fields()[1].findByType(TextInput).props.onChangeText('01011990');
  });
  expect(fields()[1].findByType(TextInput).props.value).toBe('01/01/1990');
  expect(cta().props.disabled).toBe(true);

  const genders = pressablesWithRole(tree.root.findByType(OptionGroup), 'radio');
  expect(genders).toHaveLength(3);
  await act(() => {
    genders[0].props.onPress();
  });

  expect(cta().props.disabled).toBe(false);
  await act(() => {
    cta().props.onPress();
  });
  expect(onContinue).toHaveBeenCalledWith({
    fullName: 'Pt. Rajesh Sharma',
    mobile: '9876543210',
    dateOfBirth: '01/01/1990',
    gender: 'male',
  });
});

test('step 2 renders every choice and registers the account for real', async () => {
  const onRegistered = jest.fn();
  const personalInfo = {
    fullName: 'Pt. Rajesh Sharma',
    mobile: '9876543210',
    dateOfBirth: '01/01/1990',
    gender: 'male',
  };
  const tree = await render(
    <ProfessionalDetailsScreen
      personalInfo={personalInfo}
      onRegistered={onRegistered}
    />,
  );

  const text = textOf(tree);
  expect(text).toContain('Step 2 of 4');
  expect(text).toContain('Professional Details');
  for (const specialization of SPECIALIZATIONS) {
    expect(text).toContain(specialization);
  }
  expect(text).toContain('Custom Amount');

  const cta = () => tree.root.findByType(PrimaryButton);
  expect(cta().props.disabled).toBe(true);

  const setOpeningRates = jest.spyOn(api, 'setOpeningRates');

  const [specializations, languages] = tree.root.findAllByType(ChipGroup);
  const [experience, chatRate, callRate] = tree.root.findAllByType(OptionGroup);

  await act(() => {
    pressablesWithRole(specializations, 'checkbox')[1].props.onPress();
  });
  await act(() => {
    pressablesWithRole(languages, 'checkbox')[1].props.onPress();
  });
  await act(() => {
    pressablesWithRole(experience, 'radio')[1].props.onPress();
  });
  expect(cta().props.disabled).toBe(true);

  // The chat rate alone is not enough — the call rate is asked for too.
  await act(() => {
    pressablesWithRole(chatRate, 'radio')[2].props.onPress();
  });
  expect(cta().props.disabled).toBe(true);

  await act(() => {
    pressablesWithRole(callRate, 'radio')[1].props.onPress();
  });
  expect(cta().props.disabled).toBe(false);

  // The account is opened for real here — register() is the mocked
  // services/auth call, and this is what maps the chip/option labels
  // (SPECIALIZATION_IDS/LANGUAGE_IDS/EXPERIENCE_YEARS) into the ids and
  // number the backend actually wants.
  await act(async () => {
    await cta().props.onPress();
  });

  expect(register).toHaveBeenCalledWith({
    fullName: 'Pt. Rajesh Sharma',
    phone: '9876543210',
    gender: 'male',
    dateOfBirth: '01/01/1990',
    languages: ['english'],
    expertise: ['numerology'],
    experienceYears: 4,
  });
  // Both the chat and the call rate picked above land in one call.
  expect(setOpeningRates).toHaveBeenCalledWith([
    { type: 'chat', ratePerMinute: 25 },
    { type: 'call', ratePerMinute: 20 },
  ]);
  expect(onRegistered).toHaveBeenCalledTimes(1);
});

test('step 3 uploads each document for real, one tap each, and only continues at five of five', async () => {
  const onContinue = jest.fn();
  const tree = await render(<DocumentUploadScreen onContinue={onContinue} />);

  expect(textOf(tree)).toContain('0 / 5 uploaded');
  expect(tree.root.findAllByType(UploadRow)).toHaveLength(
    REQUIRED_DOCUMENTS.length,
  );

  const cta = () => tree.root.findByType(PrimaryButton);
  expect(cta().props.disabled).toBe(true);

  const rows = () => tree.root.findAllByType(UploadRow);

  // Picking a file (the mocked filePicker resolves immediately) uploads it
  // straight away — no id number, no separate confirm step.
  await act(async () => {
    await rows()[0].props.onUpload();
  });
  expect(textOf(tree)).toContain('1 / 5 uploaded');
  expect(textOf(tree)).toContain('Uploaded successfully');
  expect(textOf(tree)).toContain('Done');
  expect(cta().props.disabled).toBe(true);

  for (let index = 1; index < REQUIRED_DOCUMENTS.length; index += 1) {
    await act(async () => {
      await rows()[index].props.onUpload();
    });
  }

  expect(textOf(tree)).toContain('5 / 5 uploaded');
  expect(cta().props.disabled).toBe(false);

  await act(() => {
    cta().props.onPress();
  });
  expect(onContinue).toHaveBeenCalledTimes(1);
});

test('step 4 needs the account number keyed twice to agree, then files it for real', async () => {
  const onSubmit = jest.fn();
  const tree = await render(
    <BankDetailsScreen
      holderNameDefault="Pt. Rajesh Sharma"
      onSubmit={onSubmit}
    />,
  );

  const text = textOf(tree);
  expect(text).toContain('Step 4 of 4');
  expect(text).toContain('Bank Details');
  expect(text).toContain('Quick Select Bank');
  expect(text).toContain('Submit Application');

  const cta = () => tree.root.findByType(PrimaryButton);
  const input = (index: number) =>
    tree.root.findAllByType(TextField)[index].findByType(TextInput);

  // The holder's name is prefilled from step 1, ahead of the bank fields.
  expect(input(0).props.value).toBe('Pt. Rajesh Sharma');

  // Tapping a quick-select bank fills the name field.
  const banks = pressablesWithRole(tree.root, 'radio');
  await act(() => {
    banks[0].props.onPress();
  });
  expect(input(1).props.value).toBe('SBI');

  await act(() => {
    input(2).props.onChangeText('1234567890');
  });
  await act(() => {
    input(4).props.onChangeText('sbin0000123');
  });
  expect(input(4).props.value).toBe('SBIN0000123');

  // The confirmation still disagrees, so the CTA stays inert.
  await act(() => {
    input(3).props.onChangeText('123456789');
  });
  expect(cta().props.disabled).toBe(true);

  await act(() => {
    input(3).props.onChangeText('1234567890');
  });
  expect(cta().props.disabled).toBe(false);

  // Filing the account and submitting the application both happen here.
  await act(async () => {
    await cta().props.onPress();
  });
  expect(onSubmit).toHaveBeenCalledTimes(1);
});

test('the confirmation screen checks status for real, and only continues once approved', async () => {
  const onGetStarted = jest.fn();
  const tree = await render(
    <ApplicationSubmittedScreen onGetStarted={onGetStarted} />,
  );
  const text = textOf(tree);

  expect(text).toContain('Application Submitted!');
  expect(text).toContain("We're reviewing your documents.");
  expect(text).toContain('24–48 hours');
  for (const stage of REVIEW_STAGES) {
    expect(text).toContain(stage);
  }
  // The first stage is done, so the rest print their position.
  expect(text).toContain('2');
  expect(text).toContain('Check Status');

  // Not approved yet — the mocked profile has no applicationStatus at all,
  // and Check Status says so rather than silently doing nothing.
  await act(async () => {
    await tree.root.findByType(PrimaryButton).props.onPress();
  });
  expect(textOf(tree)).toContain('Still under review');
  expect(onGetStarted).not.toHaveBeenCalled();

  // Now approved — the same Check Status flips every stage and the button.
  jest.spyOn(api, 'fetchProfile').mockResolvedValueOnce({
    astroCode: '',
    fullName: '',
    email: '',
    primaryMobile: '',
    secondaryMobile: '',
    gender: '',
    dob: '',
    language: '',
    experience: '',
    skill: '',
    about: '',
    applicationStatus: 'approved',
  });
  await act(async () => {
    await tree.root.findByType(PrimaryButton).props.onPress();
  });
  expect(textOf(tree)).toContain("You're Approved!");
  expect(textOf(tree)).toContain('Get Started');

  await act(() => {
    tree.root.findByType(PrimaryButton).props.onPress();
  });
  expect(onGetStarted).toHaveBeenCalledTimes(1);
});
