import type { PrayerStep } from '@/types'

/**
 * The 12 biblical prayer steps that make up the complete prayer cycle.
 * Each step is 5 minutes (300 seconds) for a total of 60 minutes.
 * Order is maintained as specified in requirements 8.2.
 */
export const PRAYER_STEPS: readonly PrayerStep[] = [
  {
    id: 0,
    name: "PRAISE",
    description: "Start your prayer hour by praising the Lord. Praise Him for things that are on your mind right now. Praise Him for one special thing He has done in your life in the past week. Praise Him for His goodness to your family.",
    duration: 300
  },
  {
    id: 1,
    name: "WAIT",
    description: "Spend time waiting on the Lord. Be silent and let Him pull together reflections for you.",
    duration: 300
  },
  {
    id: 2,
    name: "CONFESS",
    description: "Confess your sins to the Lord. Ask Him to search your heart and reveal any unconfessed sin. Confess these sins and receive His forgiveness.",
    duration: 300
  },
  {
    id: 3,
    name: "READ THE WORD",
    description: "Read a passage from the Bible. Let God speak to you through His Word. Read slowly and meditatively, asking the Holy Spirit to illuminate the text.",
    duration: 300
  },
  {
    id: 4,
    name: "ASK",
    description: "Ask God for your personal needs. Present your requests to Him with thanksgiving. Ask for wisdom, strength, and guidance in your daily life.",
    duration: 300
  },
  {
    id: 5,
    name: "INTERCESSION",
    description: "Pray for others. Intercede for your family, friends, church, community, and world leaders. Ask God to work in their lives and circumstances.",
    duration: 300
  },
  {
    id: 6,
    name: "PRAY THE WORD",
    description: "Take the Scripture you read earlier and pray it back to God. Use the words and promises of Scripture as the foundation for your prayers.",
    duration: 300
  },
  {
    id: 7,
    name: "THANK",
    description: "Thank God for His blessings, answered prayers, and faithfulness. Express gratitude for both big and small things in your life.",
    duration: 300
  },
  {
    id: 8,
    name: "SING",
    description: "Sing praises to God. This can be songs you know, hymns, or simply making a joyful noise unto the Lord. Let your heart overflow in musical worship.",
    duration: 300
  },
  {
    id: 9,
    name: "MEDITATE",
    description: "Meditate on God's character, His Word, or His works. Focus your mind on who God is and what He has done. Let His truth fill your thoughts.",
    duration: 300
  },
  {
    id: 10,
    name: "LISTEN",
    description: "Be still and listen for God's voice. Wait quietly before Him, allowing the Holy Spirit to speak to your heart. Be open to His guidance and direction.",
    duration: 300
  },
  {
    id: 11,
    name: "PRAISE",
    description: "End your prayer hour as you began - with praise. Thank God for this time of communion with Him and praise Him for who He is and what He has done.",
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