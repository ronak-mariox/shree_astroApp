import React from 'react';

import { UploadDocumentSheet } from '../src/components/UploadDocumentSheet';
import { BANK_INTRO } from '../src/data/bank';
import {
  DEFAULT_DOCUMENT_TYPE,
  DOCUMENT_TYPES,
  SEED_DOCUMENTS,
  groupDocuments,
} from '../src/data/documents';
import { DocumentsScreen } from '../src/screens/DocumentsScreen';
import {
  act,
  inputLabelled,
  pressableLabelled,
  render,
  textOf,
} from './helpers/renderWithData';

const GROUPS = groupDocuments(SEED_DOCUMENTS);

test('documents lists every group with its scans, numbers and statuses', async () => {
  const tree = await render(<DocumentsScreen />);
  const text = textOf(tree);

  expect(text).toContain('Documents');
  // Figma repeats the bank brief on this screen verbatim.
  expect(text).toContain(BANK_INTRO);
  expect(text).toContain('Add Document');

  for (const group of GROUPS) {
    expect(text).toContain(group.title);
  }
  expect(text).toContain('ID Number :');
  expect(text).toContain('5445GFDT454');
  expect(text).toContain('Status :');
  expect(text).toContain('Pending');

  // Two scans under the first group, one under each of the others.
  expect(GROUPS.map(group => group.documents.length)).toEqual([2, 1, 1]);
  expect(
    tree.root.findAll(
      node =>
        typeof node.props.accessibilityLabel === 'string' &&
        node.props.accessibilityLabel.startsWith('Update ') &&
        typeof node.props.onPress === 'function',
    ),
  ).toHaveLength(SEED_DOCUMENTS.length);
});

test('Update replaces a scan with the picked file', async () => {
  const tree = await render(<DocumentsScreen />);

  await act(async () => {
    await pressableLabelled(tree, 'Update Uploaded PAN Proof 1').props.onPress();
  });

  // The card still stands; the scan behind it now points at the new file.
  expect(textOf(tree)).toContain('Uploaded PAN Proof');
  expect(
    tree.root.findAll(
      node =>
        typeof node.props.accessibilityLabel === 'string' &&
        node.props.accessibilityLabel.startsWith('Update '),
    ).length,
  ).toBeGreaterThan(0);
});

test('the bin drops a scan, and an emptied group leaves with it', async () => {
  const tree = await render(<DocumentsScreen />);

  expect(textOf(tree)).toContain('Uploaded PAN Proof');

  await act(async () => {
    await pressableLabelled(tree, 'Delete Uploaded PAN Proof 1').props.onPress();
  });

  expect(textOf(tree)).not.toContain('Uploaded PAN Proof');
  // The ID Proof group had two scans, so dropping one leaves the card standing.
  await act(async () => {
    await pressableLabelled(tree, 'Delete Uploaded ID Proof 1 2').props.onPress();
  });
  expect(textOf(tree)).toContain('Uploaded ID Proof 1');
});

test('Add Document opens the upload sheet with every type and Id Proof picked', async () => {
  const tree = await render(<DocumentsScreen />);

  const sheet = () => tree.root.findByType(UploadDocumentSheet);
  expect(sheet().props.visible).toBe(false);

  await act(async () => {
    pressableLabelled(tree, 'Add Document').props.onPress();
  });
  expect(sheet().props.visible).toBe(true);

  const text = textOf(tree);
  expect(text).toContain('Upload documents here');
  expect(text).toContain('Select Document Type *');
  for (const option of DOCUMENT_TYPES) {
    expect(text).toContain(option);
  }
  expect(text).toContain('Upload Document');
  expect(text).toContain('Upload your file');
  expect(text).toContain('Max 5 MB files are allowed');
  expect(text).toContain('ID Proof No*');

  const chips = tree.root.findAll(
    node =>
      node.props.accessibilityRole === 'radio' &&
      typeof node.props.onPress === 'function',
  );
  expect(chips).toHaveLength(DOCUMENT_TYPES.length);
  expect(
    chips.find(chip => chip.props.accessibilityState.selected)?.props
      .accessibilityLabel,
  ).toBe(DEFAULT_DOCUMENT_TYPE);
});

test('uploading without a number or a file is refused', async () => {
  const tree = await render(<DocumentsScreen />);

  await act(async () => {
    pressableLabelled(tree, 'Add Document').props.onPress();
  });
  await act(async () => {
    await pressableLabelled(tree, 'Upload').props.onPress();
  });
  expect(textOf(tree)).toContain(
    'Enter the number this document is filed against.',
  );

  await act(async () => {
    inputLabelled(tree, 'ID Proof No*').props.onChangeText('P1234567');
  });
  await act(async () => {
    await pressableLabelled(tree, 'Upload').props.onPress();
  });
  expect(textOf(tree)).toContain('Pick a file to upload.');
  expect(tree.root.findByType(UploadDocumentSheet).props.visible).toBe(true);
});

test('a complete upload files a new scan under its own group', async () => {
  const tree = await render(<DocumentsScreen />);

  expect(textOf(tree)).not.toContain('Uploaded Passport');

  await act(async () => {
    pressableLabelled(tree, 'Add Document').props.onPress();
  });
  await act(async () => {
    pressableLabelled(tree, 'Passport').props.onPress();
  });
  await act(async () => {
    inputLabelled(tree, 'ID Proof No*').props.onChangeText('P1234567');
  });
  await act(async () => {
    await pressableLabelled(tree, 'Upload your file').props.onPress();
  });
  expect(textOf(tree)).toContain('document-1.png');

  await act(async () => {
    await pressableLabelled(tree, 'Upload').props.onPress();
  });

  expect(tree.root.findByType(UploadDocumentSheet).props.visible).toBe(false);
  const text = textOf(tree);
  expect(text).toContain('Uploaded Passport');
  expect(text).toContain('P1234567');
});

test('Close dismisses the upload sheet without filing anything', async () => {
  const tree = await render(<DocumentsScreen />);

  await act(async () => {
    pressableLabelled(tree, 'Add Document').props.onPress();
  });
  await act(async () => {
    pressableLabelled(tree, 'Passport').props.onPress();
  });
  await act(async () => {
    pressableLabelled(tree, 'Close').props.onPress();
  });

  expect(tree.root.findByType(UploadDocumentSheet).props.visible).toBe(false);
  expect(textOf(tree)).not.toContain('Uploaded Passport');
});
