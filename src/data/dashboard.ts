import type { ConsultationRequest } from '../components/RequestCard';
import type { PerformanceStats } from '../components/PerformanceCard';
import type { ServiceRow } from '../components/ServicesCard';

/** The signed-in astrologer, as the dashboard header prints them. */
export const ASTROLOGER = {
  name: 'Pt. Rajesh',
  greeting: 'Good Morning ✨',
} as const;

/** Figma nodes 104:5766, 104:5787. */
export const EARNINGS = {
  today: '₹2,840',
  todayTrend: '+₹340 this hour',
  walletBalance: '₹18,520',
} as const;

/** Figma node 104:5817. */
export const PERFORMANCE: PerformanceStats = {
  consultations: 12,
  rating: 4.9,
  acceptance: 94,
};

/** Figma node 106:6879. */
export const SERVICES: ReadonlyArray<ServiceRow> = [
  { id: 'call', label: 'Call', rate: '10', time: '01 Dec 12:00 PM', enabled: false },
  { id: 'chat', label: 'Chat', rate: '10', time: '05 Dec 12:00 PM', enabled: false },
];

/** Figma node 106:7011. */
export const LIFE_ASPECTS: ReadonlyArray<string> = [
  'Love',
  'Parents',
  'Education',
  'Career',
  'Marriage',
  'Health',
];

/** Figma node 106:7130. */
export const SKILLS: ReadonlyArray<string> = [
  'Tarot',
  'Vastu',
  'Vedic',
  'Numerology',
  'Palmistry',
  'Prashna kundli',
];

/**
 * Figma nodes 104:5910, 104:5946 for the cards; `details` is what the incoming
 * popup prints (node 108:7448). Only Priya's sheet is drawn in Figma, so Arjun's
 * follows the same shape from his card's channel and topic.
 */
export const PENDING_REQUESTS: ReadonlyArray<ConsultationRequest> = [
  {
    id: 'priya-mehta',
    name: 'Priya Mehta',
    initials: 'PM',
    age: '2m ago',
    channel: 'chat',
    topic: 'Marriage timing',
    details: {
      dateOfBirth: '15 June 1992, 06:30 AM',
      birthPlace: 'Mumbai, Maharashtra',
      issue: 'Marriage Timing & Compatibility',
      rate: '₹25/min',
      duration: '20–30 minutes',
      earnings: '₹500 – ₹750',
    },
  },
  {
    id: 'arjun-rao',
    name: 'Arjun Rao',
    initials: 'AR',
    age: '5m ago',
    channel: 'voice',
    topic: 'Career & job change',
    details: {
      dateOfBirth: '02 March 1988, 11:45 PM',
      birthPlace: 'Bengaluru, Karnataka',
      issue: 'Career & Job Change',
      rate: '₹25/min',
      duration: '15–25 minutes',
      earnings: '₹375 – ₹625',
    },
  },
];

/**
 * The badge counts three, but only two cards are drawn — the third is the one
 * still below the fold in the mockup.
 */
export const PENDING_COUNT = 3;

/**
 * The consult screen's Missed Call list reuses the same two seekers, without
 * answer buttons (Figma nodes 112:2160, 112:2188).
 */
export const MISSED_CALLS: ReadonlyArray<ConsultationRequest> =
  PENDING_REQUESTS.map(request => ({
    ...request,
    id: `missed-${request.id}`,
  }));

export const MISSED_COUNT = 3;
