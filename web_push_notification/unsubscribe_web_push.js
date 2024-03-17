require("dotenv").config();

const CheckTokenNoDB = require("../func/check_token_no_db");
const pool = require("../pg_pool");
require("dotenv").config();

const UnsubscribeWebPush = async (req, res) => {
  const { token, browserID } = req.body;

  const client = await pool.connect().catch((err) => console.log(err));

  if (!(token && browserID)) return;

  const tokenUsername = await CheckTokenNoDB(token);
  if (tokenUsername === false) return;

  try {
    await client
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
  } finally {
    client?.release();
  }
};

module.exports = UnsubscribeWebPush;
