import type { Notification } from '../components/NotificationCard';

/**
 * The astrologer's alerts feed, newest first — Figma node 112:1546. The two at
 * the top are unread, which is where the header's count comes from.
 */
export const NOTIFICATIONS: ReadonlyArray<Notification> = [
  {
    id: 'chat-request-rahul',
    kind: 'chat',
    title: 'New Chat Request',
    body: 'Rahul Sharma wants a consultation on career.',
    age: '2 min ago',
    unread: true,
  },
  {
    id: 'wallet-credit-priya',
    kind: 'wallet',
    title: 'Wallet Credited',
    body: '₹625 credited for consultation with Priya Mehta.',
    age: '45 min ago',
    unread: true,
  },
  {
    id: 'review-arjun',
    kind: 'review',
    title: 'New Review',
    body: "Arjun Rao rated you 5 stars: 'Excellent prediction!'",
    age: '2 hrs ago',
    unread: false,
  },
  {
    id: 'withdrawal-approved',
    kind: 'withdrawal',
    title: 'Withdrawal Approved',
    body: '₹5,000 withdrawal processed successfully.',
    age: 'Yesterday',
    unread: false,
  },
  {
    id: 'platform-dosha-tools',
    kind: 'platform',
    title: 'Platform Update',
    body: 'New AI tools available — Dosha analysis now live!',
    age: '2 days ago',
    unread: false,
  },
];
