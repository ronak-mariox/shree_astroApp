export type HistoryEntry = {
  id: string;
  userName: string;
  /** Already formatted, e.g. `₹49.00`. */
  amount: string;
  dateTime: string;
  duration: string;
  /** Figma prints an em dash placeholder when there is nothing to show. */
  refundStatus: string;
  refundDate: string;
};

/** Total across the whole history (Figma node 110:8940). */
export const HISTORY_TOTAL = '5,00,000';

/**
 * Figma repeats one entry down both screens (nodes 110:8942 – 110:9014), so the
 * four cards carry the same values under distinct ids.
 */
export const HISTORY_ENTRIES: ReadonlyArray<HistoryEntry> = Array.from(
  { length: 4 },
  (_, index) => ({
    id: `entry-${index + 1}`,
    userName: 'Jeeshan Chandravanshi',
    amount: '₹49.00',
    dateTime: '05 Sep 2025, 12:55 PM',
    duration: '1 min',
    refundStatus: '--',
    refundDate: '--',
  }),
);
