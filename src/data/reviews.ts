/**
 * The reviews seekers have left, as the My Reviews screen prints them.
 * Figma: node 110:12201.
 */

/** The notice over the list (Figma node 110:12332). */
export const REVIEWS_NOTICE =
  'All user ratings and reviews are visible on your profile. Each month, you are allocated 60 flags to manage negative reviews. If you receive a negative review...';

/** How many stars a rating is drawn out of. */
export const MAX_RATING = 5;

export type ReviewReply = {
  author: string;
  message: string;
};

export type Review = {
  id: string;
  reviewer: string;
  orderId: string;
  date: string;
  service: string;
  duration: string;
  rating: number;
  /** The seeker's own words, shown on the strip at the foot of the card. */
  comment: string;
  /** The astrologer's answer, once they have written one. */
  reply?: ReviewReply;
  flagged?: boolean;
  pinned?: boolean;
  /** Which year and month it falls in, for the two filters above the list. */
  year: string;
  month: string;
};

/** Figma draws two cards, both against May 2025 (nodes 110:12283, 110:12306). */
export const SEED_REVIEWS: ReadonlyArray<Review> = [
  {
    id: 'review-1',
    reviewer: 'Rahul Sharma',
    orderId: '45235452155632',
    date: 'Mar 05, 2024',
    service: 'Chat',
    duration: '4 Mins',
    rating: 1,
    comment: 'I dont like your Astrology Skills',
    year: '2025',
    month: 'May',
  },
  {
    id: 'review-2',
    reviewer: 'Rahul Sharma',
    orderId: '45235452155632',
    date: 'Mar 05, 2024',
    service: 'Chat',
    duration: '4 Mins',
    rating: 1,
    comment: 'I dont like your Astrology Skills',
    year: '2025',
    month: 'May',
  },
];

/** What the two filters above the list offer (Figma nodes 110:12338, 110:12343). */
export const REVIEW_YEARS = ['2023', '2024', '2025'];

export const REVIEW_MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

/** Figma opens the screen on May 2025. */
export const DEFAULT_REVIEW_YEAR = '2025';
export const DEFAULT_REVIEW_MONTH = 'May';

/**
 * The list as the screen shows it: the chosen year and month, then whatever the
 * search box narrows it to, pinned reviews first.
 */
export function filterReviews(
  reviews: ReadonlyArray<Review>,
  { year, month, query }: { year: string; month: string; query: string },
): Review[] {
  const needle = query.trim().toLowerCase();

  return reviews
    .filter(review => review.year === year && review.month === month)
    .filter(
      review =>
        !needle ||
        review.reviewer.toLowerCase().includes(needle) ||
        review.orderId.includes(needle) ||
        review.comment.toLowerCase().includes(needle),
    )
    .sort((a, b) => Number(b.pinned ?? false) - Number(a.pinned ?? false));
}
