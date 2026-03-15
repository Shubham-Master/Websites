const { createId, listSessions } = require("../../_lib/demo-data");

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ message: "Method not allowed." });
    return;
  }

  const sessions = listSessions();
  const session = sessions.find((item) => item.id === req.body?.sessionId);

  if (!session) {
    res.status(404).json({ message: "Session not found." });
    return;
  }

  if (session.isFree) {
    res.status(201).json({
      bookingId: createId("book"),
      bookingIntentId: null,
      bookingStatus: "confirmed",
      paymentRequired: false,
      expiresAt: null,
      amountInr: 0,
      message: "Your free session has been confirmed."
    });
    return;
  }

  res.status(201).json({
    bookingId: createId("book"),
    bookingIntentId: createId("bi"),
    bookingStatus: "pending_payment",
    paymentRequired: true,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    amountInr: session.priceInr,
    message: "Complete payment to confirm your seat."
  });
};
