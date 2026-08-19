/** Preset withdrawal amounts, and the one Figma starts on (node 112:1425). */
export const WITHDRAW_PRESETS: ReadonlyArray<{
  value: string;
  label: string;
}> = [
  { value: '1000', label: '₹1,000' },
  { value: '2000', label: '₹2,000' },
  { value: '5000', label: '₹5,000' },
  { value: '10000', label: '₹10,000' },
];

export const WITHDRAW_DEFAULT = '5000';

/** Formats a plain digit string the way the flow prints money: ₹5,000. */
export const formatRupees = (digits: string) => {
  const value = Number(digits || '0');
  return `₹${value.toLocaleString('en-IN')}`;
};
