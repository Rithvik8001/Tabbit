export const motionTokens = {
  duration: {
    instant: 80,
    fast: 140,
    normal: 200,
    relaxed: 280,
    enter: 180,
    transition: 200,
    press: 80,
  },
  easing: {
    standard: [0.2, 0, 0, 1] as const,
    emphasized: [0.28, 0.95, 0.34, 1] as const,
    smoothOut: [0.22, 1, 0.36, 1] as const,
  },
  offset: {
    screen: 10,
    listStagger: 26,
    buttonPress: 0,
  },
} as const;

export type MotionTokens = typeof motionTokens;
