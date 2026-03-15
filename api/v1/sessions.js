const { listSessions } = require("../_lib/demo-data");

module.exports = function handler(_req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.status(200).json({
    items: listSessions(),
    liveSession: null
  });
};
