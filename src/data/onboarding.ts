import type { ComponentType } from 'react';

import {
  AiAssistantIcon,
  ChatVoiceIcon,
  EarnOnlineIcon,
  ProfessionalAstrologerIcon,
} from '../components/icons/OnboardingIcons';

export type OnboardingSlide = {
  id: string;
  Icon: ComponentType<{ size?: number; color?: string }>;
  title: string;
  body: string;
  /** Width Figma sets on the heading, so it breaks where the design does. */
  titleWidth: number;
};

/** The four onboarding slides, in order (Figma nodes 104:4919 – 104:5199). */
export const ONBOARDING_SLIDES: ReadonlyArray<OnboardingSlide> = [
  {
    id: 'professional',
    Icon: ProfessionalAstrologerIcon,
    title: 'Become a Professional Astrologer',
    body: 'Join thousands of certified astrologers helping millions find clarity through ancient Vedic wisdom.',
    titleWidth: 326,
  },
  {
    id: 'earnings',
    Icon: EarnOnlineIcon,
    title: 'Earn Online, Anytime',
    body: 'Set your own rates, manage your schedule, and earn ₹50K+ monthly from the comfort of your home.',
    titleWidth: 281,
  },
  {
    id: 'consultations',
    Icon: ChatVoiceIcon,
    title: 'Chat & Voice Consultations',
    body: 'Seamlessly connect with seekers via real-time chat or high-quality voice calls — all in one app.',
    titleWidth: 326,
  },
  {
    id: 'ai',
    Icon: AiAssistantIcon,
    title: 'AI Astrology Assistant',
    body: 'Leverage cutting-edge AI trained on lakhs of charts to deliver precise predictions instantly.',
    titleWidth: 295,
  },
];

/** Features advertised on the astrologer welcome screen (Figma node 104:5401). */
export const WELCOME_FEATURES: ReadonlyArray<string> = [
  'AI Predictions',
  'Live Chat',
  'Voice Call',
  'Kundli',
];
