require("dotenv").config();
const CheckTokenNoDB = require("../func/check_token_no_db");
const { Client } = require("pg");

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

  const client = new Client({ connectionString: process.env.DATABASE_STRING });
  client.on("error", (err) =>
    console.error("something bad has happened!", err.stack)
  );
  await client.connect();

  try {
    const tokenUsername = await CheckTokenNoDB(token);
    if (tokenUsername === false) return;

    await unsubscribeWebPush(client, tokenUsername, browserID, res);
  } catch (err) {
    console.log("unexpected error:", err);
    if (!res.headersSent) res.status(500).json(err);
  } finally {
    await client?.end();
  }
};

module.exports = UnsubscribeWebPush;
