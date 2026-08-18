import React from 'react';

import { AddBankAccountSheet } from '../src/components/AddBankAccountSheet';
import { BankAttachmentSheet } from '../src/components/BankAttachmentSheet';
import { TransactionsSheet } from '../src/components/TransactionsSheet';
import {
  BANK_ACCOUNT_FIELDS,
  BANK_INTRO,
  SEED_BANK_ACCOUNTS,
  SEED_TRANSACTIONS,
  bankRowsOf,
} from '../src/data/bank';
import { BankAccountsScreen } from '../src/screens/BankAccountsScreen';
import {
  act,
  flush,
  inputLabelled,
  pressableLabelled,
  render,
  textOf,
} from './helpers/renderWithData';

const ACCOUNT = SEED_BANK_ACCOUNTS[0];

/** Fills the sheet with an account the server will accept. */
const fillValidAccount = async (tree: any) => {
  const values: Record<string, string> = {
    'Account Holder Name*': 'Priya Mehta',
    'Bank Account Number*': '1111 2222 3333',
    'Confirm Bank Account Number*': '1111 2222 3333',
    'IFSC Code *': 'HDFC0001234',
    'Bank Name *': 'HDFC Bank',
  };
  for (const field of BANK_ACCOUNT_FIELDS) {
    await act(async () => {
      inputLabelled(tree, field.label).props.onChangeText(values[field.label]);
    });
  }
};

test('bank details prints the brief and every row of the account on file', async () => {
  const text = textOf(await render(<BankAccountsScreen />));

  expect(text).toContain('Bank Details');
  expect(text).toContain(BANK_INTRO);
  expect(text).toContain('Banking Information');

  for (const row of bankRowsOf(ACCOUNT)) {
    expect(text).toContain(row.label);
    expect(text).toContain(row.value);
  }

  expect(text).toContain('View Trangection');
  expect(text).toContain('+ Add Other Bank Account');
});

test('the eye beside Status opens the attachment sheet and names the proof', async () => {
  const tree = await render(<BankAccountsScreen />);

  const attachment = () => tree.root.findByType(BankAttachmentSheet);
  expect(attachment().props.visible).toBe(false);

  await act(async () => {
    pressableLabelled(
      tree,
      `View attachment for ${ACCOUNT.bankName}`,
    ).props.onPress();
  });
  expect(attachment().props.visible).toBe(true);

  const text = textOf(tree);
  expect(text).toContain('Bank Attachment');
  expect(text).toContain(ACCOUNT.proofFileName as string);

  await act(async () => {
    attachment().props.onDismiss();
  });
  expect(attachment().props.visible).toBe(false);
});

test('View Trangection opens the ledger', async () => {
  const tree = await render(<BankAccountsScreen />);

  const sheet = () => tree.root.findByType(TransactionsSheet);
  expect(sheet().props.visible).toBe(false);

  await act(async () => {
    pressableLabelled(tree, 'View Trangection').props.onPress();
  });
  expect(sheet().props.visible).toBe(true);

  // The ledger is fetched when the sheet opens.
  await flush();
  const text = textOf(tree);
  expect(text).toContain('Transactions');
  for (const transaction of SEED_TRANSACTIONS) {
    expect(text).toContain(transaction.reference);
    expect(text).toContain(transaction.amount);
  }
});

test('the CTA opens the add-account sheet with all five fields and a drop zone', async () => {
  const tree = await render(<BankAccountsScreen />);

  const sheet = () => tree.root.findByType(AddBankAccountSheet);
  expect(sheet().props.visible).toBe(false);

  await act(async () => {
    pressableLabelled(tree, 'Add Other Bank Account').props.onPress();
  });
  expect(sheet().props.visible).toBe(true);

  const text = textOf(tree);
  expect(text).toContain('Add New Account');
  for (const field of BANK_ACCOUNT_FIELDS) {
    expect(text).toContain(field.label);
  }
  expect(text).toContain('Account Proof *');
  expect(text).toContain('Upload your file(s) or');
  expect(text).toContain('Max 5 MB files are allowed');
  expect(text).toContain('Close');
  expect(text).toContain('Submit');
});

test('an incomplete account is refused and the sheet stays open', async () => {
  const tree = await render(<BankAccountsScreen />);

  await act(async () => {
    pressableLabelled(tree, 'Add Other Bank Account').props.onPress();
  });
  await act(async () => {
    await pressableLabelled(tree, 'Submit').props.onPress();
  });

  expect(tree.root.findByType(AddBankAccountSheet).props.visible).toBe(true);
  expect(textOf(tree)).toContain('Enter the account holder’s name.');
});

test('mismatched account numbers are refused', async () => {
  const tree = await render(<BankAccountsScreen />);

  await act(async () => {
    pressableLabelled(tree, 'Add Other Bank Account').props.onPress();
  });
  await fillValidAccount(tree);
  await act(async () => {
    inputLabelled(tree, 'Confirm Bank Account Number*').props.onChangeText(
      '9999',
    );
  });
  await act(async () => {
    await pressableLabelled(tree, 'Submit').props.onPress();
  });

  expect(textOf(tree)).toContain('The two account numbers do not match.');
});

test('a complete account is filed, closes the sheet and appears on the screen', async () => {
  const tree = await render(<BankAccountsScreen />);

  await act(async () => {
    pressableLabelled(tree, 'Add Other Bank Account').props.onPress();
  });
  await fillValidAccount(tree);

  // Picking a proof records the file the sheet will submit.
  await act(async () => {
    await pressableLabelled(tree, 'Upload account proof').props.onPress();
  });
  expect(textOf(tree)).toContain('proof-1.png');

  await act(async () => {
    await pressableLabelled(tree, 'Submit').props.onPress();
  });

  expect(tree.root.findByType(AddBankAccountSheet).props.visible).toBe(false);

  const text = textOf(tree);
  expect(text).toContain('HDFC Bank');
  expect(text).toContain('1111 2222 3333');
  // The original account is still listed alongside the new one.
  expect(text).toContain(ACCOUNT.bankName);
});

test('Close dismisses the add-account sheet without filing anything', async () => {
  const tree = await render(<BankAccountsScreen />);

  await act(async () => {
    pressableLabelled(tree, 'Add Other Bank Account').props.onPress();
  });
  await fillValidAccount(tree);
  await act(async () => {
    pressableLabelled(tree, 'Close').props.onPress();
  });

  expect(tree.root.findByType(AddBankAccountSheet).props.visible).toBe(false);
  expect(textOf(tree)).not.toContain('HDFC Bank');
});
