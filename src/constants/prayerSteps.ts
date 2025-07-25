import type { PrayerStep } from '@/types'

/**
 * The 12 biblical prayer steps that make up the complete prayer cycle.
 * Each step is 5 minutes (300 seconds) for a total of 60 minutes.
 * Order is maintained as specified in requirements 8.2.
 * 
 * Note: name and description are now translation keys that will be resolved
 * by the components using vue-i18n
 */
export const PRAYER_STEPS: readonly PrayerStep[] = [
  {
    id: 0,
    name: "prayer.steps.praise.name",
    description: "prayer.steps.praise.description",
    duration: 300
  },
  {
    id: 1,
    name: "prayer.steps.wait.name",
    description: "prayer.steps.wait.description",
    duration: 300
  },
  {
    id: 2,
    name: "prayer.steps.confess.name",
    description: "prayer.steps.confess.description",
    duration: 300
  },
  {
    id: 3,
    name: "prayer.steps.read_the_word.name",
    description: "prayer.steps.read_the_word.description",
    duration: 300
  },
  {
    id: 4,
    name: "prayer.steps.ask.name",
    description: "prayer.steps.ask.description",
    duration: 300
  },
  {
    id: 5,
    name: "prayer.steps.intercession.name",
    description: "prayer.steps.intercession.description",
    duration: 300
  },
  {
    id: 6,
    name: "prayer.steps.pray_the_word.name",
    description: "prayer.steps.pray_the_word.description",
    duration: 300
  },
  {
    id: 7,
    name: "prayer.steps.thank.name",
    description: "prayer.steps.thank.description",
    duration: 300
  },
  {
    id: 8,
    name: "prayer.steps.sing.name",
    description: "prayer.steps.sing.description",
    duration: 300
  },
  {
    id: 9,
    name: "prayer.steps.meditate.name",
    description: "prayer.steps.meditate.description",
    duration: 300
  },
  {
    id: 10,
    name: "prayer.steps.listen.name",
    description: "prayer.steps.listen.description",
    duration: 300
  },
  {
    id: 11,
    name: "prayer.steps.praise_end.name",
    description: "prayer.steps.praise_end.description",
    duration: 300
  }
] as const;

/**
 * Total number of prayer steps in the cycle
 */
export const TOTAL_PRAYER_STEPS = PRAYER_STEPS.length;

/**
 * Duration of each prayer step in seconds (5 minutes)
 */
export const STEP_DURATION_SECONDS = 300;

/**
 * Total duration of the complete prayer cycle in seconds (60 minutes)
 */
export const TOTAL_CYCLE_DURATION_SECONDS = PRAYER_STEPS.length * STEP_DURATION_SECONDS;