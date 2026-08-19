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

