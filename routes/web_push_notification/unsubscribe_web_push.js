require("dotenv").config();

const CheckTokenNoDB = require("../../func/check_token_no_db");
const _pool = require("../../pg_pool");
require("dotenv").config();

const UnsubscribeWebPush = async (req, res) => {
  const { token, browserID } = req.body;

  if (!(token && browserID)) {
    res.status(400).json("data missing");
    return;
  }

  const tokenUsername = await CheckTokenNoDB(token);
  if (tokenUsername === false) {
    if (!res.headersSent) res.status(401).json("wrong token");
    return;
  }

  try {
    await _pool
      .query(
        `DELETE FROM subscribe_web_push WHERE browser_id = $1 AND username = $2`,
        [browserID, tokenUsername]
      )
      .then(() => {
        if (!res.headersSent) res.send("deleted");
      })
      .catch((err) => {
        if (!res.headersSent) res.send(err);
      });
  } catch (err) {
    if (!res.headersSent) res.status(500).json(err);
  }
};

module.exports = UnsubscribeWebPush;
