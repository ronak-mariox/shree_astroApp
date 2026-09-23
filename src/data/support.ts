import type { ComponentType } from 'react';

import {
  AstrologerIssueIcon,
  BagIcon,
  HeartIcon,
} from '../components/icons/SupportIcons';

/**
 * What the Help & Support screen offers, and the dispute it can raise.
 * Figma: node 110:12355.
 */

/** One question and its answer (Figma nodes 110:12380 – 110:12394). */
export type Faq = {
  question: string;
  answer: string;
};

/**
 * Figma leaves every question as "Heading text" and only writes the answers, so
 * the questions here are drawn from what each answer covers.
 */
export const FAQS: ReadonlyArray<Faq> = [
  {
    question: 'What happens after a reading?',
    answer: 'Complete remedies and follow recommendations',
  },
  {
    question: 'How am I paid?',
    answer: 'Per minute billing based on astrologer rates',
  },
  {
    question: 'Can a consultation be refunded?',
    answer: 'Refunds available within 24 hours for select services',
  },
];

/** One tile in the Issue Type grid (Figma nodes 110:12403 – 110:12427). */
export type IssueType = {
  id: string;
  label: string;
  Icon: ComponentType<{ size?: number; color?: string }>;
};

export const ISSUE_TYPES: ReadonlyArray<IssueType> = [
  { id: 'astrologer', label: 'Astrologer Issue', Icon: AstrologerIssueIcon },
  { id: 'puja', label: 'Puja Service', Icon: BagIcon },
  { id: 'product', label: 'Product Issue', Icon: BagIcon },
  { id: 'donation', label: 'Donation Query', Icon: HeartIcon },
];

/** A dispute this astrologer has raised, as GET /support/tickets returns it. */
export type RaisedDispute = {
  _id: string;
  reference: string;
  issueType: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  /** What an admin wrote back, once they have. */
  resolution?: string;
  createdAt: string;
};

/** "in_progress" -> "In progress". */
export const disputeStatusLabel = (status: string) =>
  status.replace(/_/g, ' ').replace(/^./, character => character.toUpperCase());

export type Dispute = {
  issueType: string;
  description: string;
};

/** Everything a dispute needs before the server will take it. */
export function validateDispute(dispute: Dispute): string | null {
  if (!dispute.issueType) return 'Pick the kind of issue you are reporting.';
  if (dispute.description.trim().length < 10) {
    return 'Describe the issue in a little more detail.';
  }
  return null;
}
