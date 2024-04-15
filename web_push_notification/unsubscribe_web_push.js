require("dotenv").config();
const CheckTokenNoDB = require("../func/check_token_no_db");
const { Pool } = require("pg");

const unsubscribeWebPush = async (client, tokenUsername, browserID, res) => {
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
};

const UnsubscribeWebPush = async (req, res) => {
  const { token, browserID } = req.body;

  if (!(token && browserID)) return;

  const pool = new Pool({ connectionString: process.env.DATABASE_STRING });
  const client = await pool.connect().catch((err) => {
    console.log(err);
    res.status(500).json(err);
  });
  client.on("error", (err) =>
    console.error("something bad has happened!", err.stack)
  );

  try {
    const tokenUsername = await CheckTokenNoDB(token);
    if (tokenUsername === false) return;

    await unsubscribeWebPush(client, tokenUsername, browserID, res);
  } catch (err) {
    console.log("unexpected error:", err);
    if (!res.headersSent) res.status(500).json(err);
  } finally {
    await client?.release();
  }
};

module.exports = UnsubscribeWebPush;
