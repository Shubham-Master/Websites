const { createId } = require("../_lib/demo-data");

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

  res.status(201).json({
    leadId: createId("lead"),
    message: "Lead captured successfully."
  });
};
