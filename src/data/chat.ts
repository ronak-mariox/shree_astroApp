import type { ChatMessage } from '../components/ChatBubble';

/** The seeker on the other end of the live consultation (Figma node 110:500). */
export const CHAT_PEER = {
  name: 'Astro Rakesh',
  elapsed: '04:58 mins',
} as const;

/**
 * The transcript as Figma lays it out, top to bottom, keeping its own line
 * breaks and the top corner each bubble's tail flicks off
 * (nodes 110:462, 110:440, 110:478, 110:470, 110:450).
 */
export const CHAT_TRANSCRIPT: ReadonlyArray<ChatMessage> = [
  {
    id: 'birth-details',
    from: 'seeker',
    tail: 'right',
    lines: [
      'Hi',
      'Below are my details:',
      'Name: Mithu',
      'Gender: Male',
      'DOB: 08-Feb-1999',
      'TOB: 12:45 PM',
      'POB: Delhi, India',
    ],
    time: '10:52 AM',
    action: 'Generate Kundli',
  },
  {
    id: 'greeting',
    from: 'astrologer',
    tail: 'left',
    lines: [
      'Welcome to KarmaGuru',
      'Astrologer will join within 10 second',
      '',
      'Please share your question in the',
      'meanwhile',
    ],
    time: '10:52 AM',
  },
  {
    id: 'greeting-quoted',
    from: 'seeker',
    tail: 'left',
    quote: {
      lines: ['Welcome to KarmaGuru', 'Astrologer will join within 10 second'],
    },
    lines: ['Please share your question in the the', 'meanwhile'],
    time: '10:54 AM',
  },
  {
    id: 'reply-astrologer',
    from: 'astrologer',
    tail: 'right',
    lines: [
      'Lorem Ipsum is simply dummy text',
      'of the printing and typesetting ind',
      'ustry. Lorem Ipsum has been the m',
      'e anwhile',
    ],
    time: '10:54 AM',
  },
  {
    id: 'reply-seeker',
    from: 'seeker',
    tail: 'left',
    lines: [
      'Lorem Ipsum is simply dummy text',
      'of the printing and typesetting ind',
      'ustry. Lorem Ipsum has been the m',
      'e anwhile',
    ],
    time: '10:54 AM',
  },
];

export type DashaRow = {
  planet: string;
  startDate: string;
  endDate: string;
};

/**
 * The dasha table (Figma nodes 110:3129 – 110:3158). The same nine rows carry
 * every level of the drill-down in the design.
 */
export const DASHA_ROWS: ReadonlyArray<DashaRow> = [
  { planet: 'Jupiter', startDate: 'Birth', endDate: '10-may-1999' },
  { planet: 'Saturn', startDate: '10-may-1999', endDate: '10-may-2018' },
  { planet: 'Mercury', startDate: '10-may-2018', endDate: '10-may-2035' },
  { planet: 'Ketu', startDate: '10-may-2035', endDate: '10-may-2042' },
  { planet: 'Venus', startDate: '10-may-2042', endDate: '10-may-2062' },
  { planet: 'Sun', startDate: '10-may-2062', endDate: '10-may-2068' },
  { planet: 'Moon', startDate: '10-may-2068', endDate: '10-may-2078' },
  { planet: 'Mars', startDate: '10-may-2078', endDate: '10-may-2085' },
  { planet: 'Rahu', startDate: '10-may-2085', endDate: '10-may-2103' },
];

/** The three levels the dasha table drills through, outermost first. */
export const DASHA_LEVELS: ReadonlyArray<string> = [
  'Mahadasha',
  'Antardasha',
  'Pratyantardasha',
];
