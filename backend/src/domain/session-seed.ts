import type { Session } from "./types.js";

const IST_OFFSET = "+05:30";

function futureIso(daysAhead: number, hour: number, minute: number): string {
  const target = new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000);
  const year = target.getUTCFullYear();
  const month = String(target.getUTCMonth() + 1).padStart(2, "0");
  const day = String(target.getUTCDate()).padStart(2, "0");
  const hh = String(hour).padStart(2, "0");
  const mm = String(minute).padStart(2, "0");
  return new Date(`${year}-${month}-${day}T${hh}:${mm}:00${IST_OFFSET}`).toISOString();
}

function addMinutes(iso: string, minutes: number): string {
  return new Date(new Date(iso).getTime() + minutes * 60 * 1000).toISOString();
}

const familyDinnersStart = futureIso(7, 19, 30);
const askForHelpStart = futureIso(14, 18, 0);
const musicJoyStart = futureIso(21, 20, 0);
const firstTimerStart = futureIso(28, 19, 0);

export const seededSessions: Session[] = [
  {
    id: "sess_family_dinners",
    slug: "navigating-family-dinners",
    title: "Navigating Family Dinners",
    description:
      "For those who've felt lost in the noise of large family gatherings and found creative ways to stay present.",
    language: "Hinglish",
    startsAt: familyDinnersStart,
    endsAt: addMinutes(familyDinnersStart, 75),
    timezone: "Asia/Kolkata",
    capacity: 7,
    priceInr: 299,
    isFree: false,
    status: "published",
    captionsEnabledByDefault: true,
    zeroRecordingPolicy: true
  },
  {
    id: "sess_ask_for_help",
    slug: "the-confidence-to-ask-for-help",
    title: "The Confidence to Ask for Help",
    description:
      "Exploring the vulnerability and courage it takes to say \"I didn't catch that\" and how to own it.",
    language: "English",
    startsAt: askForHelpStart,
    endsAt: addMinutes(askForHelpStart, 75),
    timezone: "Asia/Kolkata",
    capacity: 7,
    priceInr: 299,
    isFree: false,
    status: "published",
    captionsEnabledByDefault: true,
    zeroRecordingPolicy: true
  },
  {
    id: "sess_music_joy",
    slug: "rediscovering-music-and-joy",
    title: "Rediscovering Music & Joy",
    description:
      "Stories of finding a new relationship with sound, rhythm, and music, however that looks for you.",
    language: "Hinglish",
    startsAt: musicJoyStart,
    endsAt: addMinutes(musicJoyStart, 75),
    timezone: "Asia/Kolkata",
    capacity: 7,
    priceInr: 299,
    isFree: false,
    status: "published",
    captionsEnabledByDefault: true,
    zeroRecordingPolicy: true
  },
  {
    id: "sess_first_timer",
    slug: "first-timer-open-circle",
    title: "First-Timer Open Circle",
    description:
      "A gentle introduction with no theme, perfect for first-time members who just want to listen or share softly.",
    language: "Hinglish",
    startsAt: firstTimerStart,
    endsAt: addMinutes(firstTimerStart, 75),
    timezone: "Asia/Kolkata",
    capacity: 10,
    priceInr: 0,
    isFree: true,
    status: "published",
    captionsEnabledByDefault: true,
    zeroRecordingPolicy: true
  }
];
