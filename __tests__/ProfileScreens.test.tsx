import React from 'react';

import { FIXTURE_PROFILE } from './helpers/fixtures';

import { OptionPickerSheet } from '../src/components/OptionPickerSheet';
import {
  EDIT_GALLERIES,
  personalInformationOf,
  primaryMobileOf,
} from '../src/data/profile';
import { EditProfileScreen } from '../src/screens/EditProfileScreen';
import { MyProfileScreen } from '../src/screens/MyProfileScreen';
import {
  act,
  inputLabelled,
  pressableLabelled,
  render,
  textOf,
} from './helpers/renderWithData';

test('my profile prints the identity, every detail row, the blurb and the gallery', async () => {
  const text = textOf(await render(<MyProfileScreen />));

  expect(text).toContain('My Profile');
  expect(text).toContain(FIXTURE_PROFILE.fullName);
  expect(text).toContain(FIXTURE_PROFILE.email);
  expect(text).toContain(primaryMobileOf(FIXTURE_PROFILE));

  expect(text).toContain('Personal Information');
  for (const row of personalInformationOf(FIXTURE_PROFILE)) {
    expect(text).toContain(row.label);
    expect(text).toContain(row.value);
  }

  expect(text).toContain('About Us');
  expect(text).toContain(FIXTURE_PROFILE.about);
  expect(text).toContain('Astrologer Profile Gallery');
});

test('my profile reports back, and both edit affordances open the form', async () => {
  const onBack = jest.fn();
  const onEdit = jest.fn();
  const tree = await render(
    <MyProfileScreen onBack={onBack} onEdit={onEdit} />,
  );

  await act(async () => {
    pressableLabelled(tree, 'Back').props.onPress();
  });
  expect(onBack).toHaveBeenCalled();

  await act(async () => {
    pressableLabelled(tree, 'Edit profile').props.onPress();
  });
  await act(async () => {
    pressableLabelled(tree, 'Edit Astrologer Profile Gallery').props.onPress();
  });
  expect(onEdit).toHaveBeenCalledTimes(2);
});

test('edit profile opens on the record and lays out both galleries', async () => {
  const text = textOf(await render(<EditProfileScreen />));

  expect(text).toContain('Edit Profile');
  expect(text).toContain('Cancel');
  expect(text).toContain('Update');

  for (const label of [
    'Full name',
    'E-mail',
    'Gender',
    'DOB',
    'Primary Mobile',
    'Secondary Mobile*',
    'Exeperience',
    'Skill*',
    'Language*',
    'About',
  ]) {
    expect(text).toContain(label);
  }

  // The select fields print the record's own values, not Figma's mock ones.
  expect(text).toContain(FIXTURE_PROFILE.gender);
  expect(text).toContain(FIXTURE_PROFILE.skill);
  expect(text).toContain(FIXTURE_PROFILE.language);

  for (const gallery of EDIT_GALLERIES) {
    expect(text).toContain(gallery.title);
  }
  expect(text).toContain('New Request For Details Change');
  expect(text).toContain('No change requests found');
});

test('Update saves the edit, and My Profile then reads it back', async () => {
  const onClose = jest.fn();
  const tree = await render(
    <>
      <EditProfileScreen onClose={onClose} />
      <MyProfileScreen />
    </>,
  );

  await act(async () => {
    inputLabelled(tree, 'Full name').props.onChangeText('Astro Ragini');
  });

  await act(async () => {
    await pressableLabelled(tree, 'Update').props.onPress();
  });

  expect(onClose).toHaveBeenCalled();
  // Both screens share one store, so the read screen has the new name.
  expect(textOf(tree)).toContain('Astro Ragini');
  expect(textOf(tree)).not.toContain(FIXTURE_PROFILE.fullName);
});

test('Cancel leaves the form without saving anything', async () => {
  const onClose = jest.fn();
  const tree = await render(
    <>
      <EditProfileScreen onClose={onClose} />
      <MyProfileScreen />
    </>,
  );

  await act(async () => {
    inputLabelled(tree, 'Full name').props.onChangeText('Discarded');
  });
  await act(async () => {
    pressableLabelled(tree, 'Cancel').props.onPress();
  });

  expect(onClose).toHaveBeenCalled();
  expect(textOf(tree)).toContain(FIXTURE_PROFILE.fullName);
});

test('the Gender select opens a picker whose choice lands on the field', async () => {
  const tree = await render(<EditProfileScreen />);

  expect(tree.root.findAllByType(OptionPickerSheet)).toHaveLength(0);

  await act(async () => {
    pressableLabelled(tree, 'Gender').props.onPress();
  });

  const picker = tree.root.findByType(OptionPickerSheet);
  expect(picker.props.options).toContain('Male');

  await act(async () => {
    pressableLabelled(tree, 'Male').props.onPress();
  });
  await act(async () => {
    pressableLabelled(tree, 'Done').props.onPress();
  });

  expect(tree.root.findAllByType(OptionPickerSheet)).toHaveLength(0);
  expect(textOf(tree)).toContain('Male');
});

test('the Skill picker takes several at once and joins them the way the design prints them', async () => {
  const tree = await render(<EditProfileScreen />);

  await act(async () => {
    pressableLabelled(tree, 'Skill*').props.onPress();
  });

  // Start from a clean slate, then take two.
  for (const skill of ['Numerology', 'FaceReading', 'Nadi', 'Tarot']) {
    await act(async () => {
      pressableLabelled(tree, skill).props.onPress();
    });
  }
  await act(async () => {
    pressableLabelled(tree, 'Vedic').props.onPress();
  });
  await act(async () => {
    pressableLabelled(tree, 'Vastu').props.onPress();
  });
  await act(async () => {
    pressableLabelled(tree, 'Done').props.onPress();
  });

  expect(textOf(tree)).toContain('Vedic , Vastu');
});

test('the photo button records the picked file', async () => {
  const tree = await render(<EditProfileScreen />);

  expect(textOf(tree)).not.toContain('New photo selected');

  await act(async () => {
    await pressableLabelled(tree, 'Change profile photo').props.onPress();
  });

  expect(textOf(tree)).toContain('New photo selected: photo-1.jpg');
});
