const baseYear = 2026;

const seededSessions = [
  {
    id: "sess_family_dinners",
    slug: "navigating-family-dinners",
    title: "Navigating Family Dinners",
    description:
      "For those who've felt lost in the noise of large family gatherings and found creative ways to stay present.",
    language: "Hinglish",
    startsAt: new Date(`${baseYear}-03-07T19:30:00+05:30`).toISOString(),
    endsAt: new Date(`${baseYear}-03-07T20:45:00+05:30`).toISOString(),
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
    startsAt: new Date(`${baseYear}-03-14T18:00:00+05:30`).toISOString(),
    endsAt: new Date(`${baseYear}-03-14T19:15:00+05:30`).toISOString(),
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
    startsAt: new Date(`${baseYear}-03-21T20:00:00+05:30`).toISOString(),
    endsAt: new Date(`${baseYear}-03-21T21:15:00+05:30`).toISOString(),
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
    startsAt: new Date(`${baseYear}-03-28T19:00:00+05:30`).toISOString(),
    endsAt: new Date(`${baseYear}-03-28T20:15:00+05:30`).toISOString(),
    timezone: "Asia/Kolkata",
    capacity: 10,
    priceInr: 0,
    isFree: true,
    status: "published",
    captionsEnabledByDefault: true,
    zeroRecordingPolicy: true
  }
];

function listSessions() {
  return seededSessions.map((session) => ({
    ...session,
    remainingSeats: session.capacity,
    waitlistOpen: true
  }));
}

function createId(prefix) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

module.exports = {
  listSessions,
  createId
};
