/**
 * The astrologer's payout accounts, and the transactions settled against them.
 * Figma: nodes 110:6514, 110:6793.
 */

/** The paragraph under the screen's heading (Figma node 110:6608). */
export const BANK_INTRO =
  'Please submit your bank details to ensure smooth and timely payment processing for your astrological services, including video calls, audio calls, live broadcasts, and chat consultations. Accurate information will help process payments efficiently.';

export type BankAccount = {
  id: string;
  holderName: string;
  bankName: string;
  accountNumber: string;
  ifsc: string;
  createdDate: string;
  status: string;
  /** The proof filed against it; the file picker itself is stubbed. */
  proofFileName?: string;
};

/** One row of the banking-information list. */
export type BankRow = {
  label: string;
  value: string;
  /** Status carries the eye that opens the account's attachment. */
  attachment?: boolean;
};

/** The list a card prints, in Figma's order. */
export function bankRowsOf(account: BankAccount): BankRow[] {
  return [
    { label: 'ACCOUNT HOLDER NAME :', value: account.holderName },
    { label: 'BANK NAME :', value: account.bankName },
    { label: 'BANK ACCOUNT NUMBER :', value: account.accountNumber },
    { label: 'IFSC CODE :', value: account.ifsc },
    { label: 'CREATED DATE:', value: account.createdDate },
    { label: 'Status:', value: account.status, attachment: true },
  ];
}

/** A field on the add-account sheet. */
export type BankAccountField = {
  key: keyof BankAccountDraft;
  label: string;
  placeholder: string;
};

export type BankAccountDraft = {
  holderName: string;
  accountNumber: string;
  confirmAccountNumber: string;
  ifsc: string;
  bankName: string;
};

/** Figma nodes 110:6805 – 110:6851, in the order they are stacked. */
export const BANK_ACCOUNT_FIELDS: ReadonlyArray<BankAccountField> = [
  {
    key: 'holderName',
    label: 'Account Holder Name*',
    placeholder: 'Enter account holder name',
  },
  {
    key: 'accountNumber',
    label: 'Bank Account Number*',
    placeholder: 'Enter bank account number',
  },
  {
    key: 'confirmAccountNumber',
    label: 'Confirm Bank Account Number*',
    placeholder: 'Re-enter bank account number',
  },
  {
    key: 'ifsc',
    label: 'IFSC Code *',
    placeholder: 'e.g. SBIN0001234',
  },
  {
    key: 'bankName',
    label: 'Bank Name *',
    placeholder: 'Enter bank name',
  },
];

export const EMPTY_BANK_ACCOUNT: BankAccountDraft = {
  holderName: '',
  accountNumber: '',
  confirmAccountNumber: '',
  ifsc: '',
  bankName: '',
};

/**
 * Four letters (the bank), a literal `0` (reserved), then six letters or
 * digits (the branch) — matches the backend's own `bankAccountSchema.ifsc`
 * pattern exactly, so a bad code is caught here rather than on a round trip.
 */
const IFSC_PATTERN = /^[A-Z]{4}0[A-Z0-9]{6}$/;

/** Everything the sheet needs before it will accept a new account. */
export function validateBankAccount(draft: BankAccountDraft): string | null {
  if (!draft.holderName.trim()) return 'Enter the account holder’s name.';
  if (!draft.accountNumber.trim()) return 'Enter the bank account number.';
  if (draft.confirmAccountNumber !== draft.accountNumber) {
    return 'The two account numbers do not match.';
  }
  if (!draft.ifsc.trim()) return 'Enter the IFSC code.';
  if (!IFSC_PATTERN.test(draft.ifsc.trim().toUpperCase())) {
    return 'Enter a valid IFSC code.';
  }
  if (!draft.bankName.trim()) return 'Enter the bank name.';
  return null;
}

/** One row of the payout ledger (Figma node 110:6900). */
export type BankTransaction = {
  id: string;
  reference: string;
  date: string;
  amount: string;
  status: string;
};
