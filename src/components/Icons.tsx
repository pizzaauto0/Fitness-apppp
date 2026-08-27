type P = { size?: number };

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
});

export const IconSend = ({ size = 20 }: P) => (
  <svg {...base(size)}>
    <path d="M7 17 17 7M9 7h8v8" />
  </svg>
);

export const IconReceive = ({ size = 20 }: P) => (
  <svg {...base(size)}>
    <path d="M17 7 7 17m8 0H7V9" />
  </svg>
);

export const IconSwap = ({ size = 20 }: P) => (
  <svg {...base(size)}>
    <path d="M4 8h13l-3.5-3.5M20 16H7l3.5 3.5" />
  </svg>
);

export const IconClock = ({ size = 19 }: P) => (
  <svg {...base(size)}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 1.8" />
  </svg>
);

export const IconSettings = ({ size = 19 }: P) => (
  <svg {...base(size)}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 1 1-4 0v-.1A1.6 1.6 0 0 0 7.9 19l-.1.1A2 2 0 1 1 5 16.3l.1-.1a1.6 1.6 0 0 0-1.1-2.7H3a2 2 0 1 1 0-4h.1A1.6 1.6 0 0 0 5 7.9L4.9 7.8A2 2 0 1 1 7.7 5l.1.1a1.6 1.6 0 0 0 1.8.3H9.7A1.6 1.6 0 0 0 10.7 4V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 2.7 1.1l.1-.1A2 2 0 1 1 20.3 7l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1Z" />
  </svg>
);

export const IconBack = ({ size = 20 }: P) => (
  <svg {...base(size)}>
    <path d="M14.5 5.5 8 12l6.5 6.5" />
  </svg>
);

export const IconClose = ({ size = 20 }: P) => (
  <svg {...base(size)}>
    <path d="m6 6 12 12M18 6 6 18" />
  </svg>
);

export const IconStar = ({ size = 20, filled = false }: P & { filled?: boolean }) => (
  <svg {...base(size)} fill={filled ? 'currentColor' : 'none'}>
    <path d="m12 4 2.4 5 5.5.8-4 3.8 1 5.4-4.9-2.6L7.1 19l1-5.4-4-3.8L9.6 9z" />
  </svg>
);

export const IconWallet = ({ size = 21 }: P) => (
  <svg {...base(size)}>
    <path d="M3 8a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <path d="M16 12.5h2.5" />
  </svg>
);

export const IconChart = ({ size = 21 }: P) => (
  <svg {...base(size)}>
    <path d="M4 18V9m5 9V5m5 13v-6m5 6V8" />
  </svg>
);

export const IconCopy = ({ size = 18 }: P) => (
  <svg {...base(size)}>
    <rect x="9" y="9" width="11" height="11" rx="2.4" />
    <path d="M5.5 15H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v.5" />
  </svg>
);

export const IconInfo = ({ size = 15 }: P) => (
  <svg {...base(size)} strokeWidth={2}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5M12 7.6v.6" />
  </svg>
);

