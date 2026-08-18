import type { ComponentType } from 'react';

import {
  CallHistoryIcon,
  ChatHistoryIcon,
  DashboardIcon,
  DeleteAccountIcon,
  EarningsIcon,
  HelpIcon,
  MissedCallIcon,
  ReferIcon,
  ReviewIcon,
} from '../components/icons/MenuIcons';

/** The astrologer, as the sidebar's profile block prints them. */
export const MENU_PROFILE = {
  name: 'Astro Ragini',
  phone: '+91 8178496252',
} as const;

export type MenuItem = {
  id: string;
  label: string;
  Icon: ComponentType<{ size?: number; color?: string }>;
  /** Delete Account is the one destructive entry (Figma node 110:13074). */
  destructive?: boolean;
};

/** Figma nodes 110:13023 – 110:13073, in order. */
export const MENU_ITEMS: ReadonlyArray<MenuItem> = [
  { id: 'dashboard', label: 'Dashboard', Icon: DashboardIcon },
  { id: 'call-history', label: 'Call History', Icon: CallHistoryIcon },
  { id: 'chat-history', label: 'Chat History', Icon: ChatHistoryIcon },
  { id: 'missed-call', label: 'Missed Call', Icon: MissedCallIcon },
  { id: 'earnings', label: 'Earnings', Icon: EarningsIcon },
  {
    id: 'price-change',
    label: 'Price Change Request',
    // Figma reuses the earnings mark here (node 110:13048).
    Icon: EarningsIcon,
  },
  { id: 'my-review', label: 'My Review', Icon: ReviewIcon },
  { id: 'refer', label: 'Refer and Earn', Icon: ReferIcon },
  { id: 'help', label: 'Help and Support', Icon: HelpIcon },
  {
    id: 'delete-account',
    label: 'Delete Account',
    Icon: DeleteAccountIcon,
    destructive: true,
  },
];
