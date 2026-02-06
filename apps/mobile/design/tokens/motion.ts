export const motionTokens = {
  duration: {
    enter: 420,
    transition: 260,
    press: 140,
  },
  easing: {
    smoothOut: [0.22, 1, 0.36, 1] as const,
  },
  offset: {
    screen: 12,
  },
} as const;

export type MotionTokens = typeof motionTokens;
