require("dotenv").config();
const { Client } = require("pg");
const checkToken = require("../../func/check_token");
require("dotenv").config();

const SubscribeWebPush = async (req, res) => {
  const { token, pushSubscription } = req.body;

  let pushSubscriptionJSON = JSON.parse(pushSubscription);

  if (!(token && pushSubscriptionJSON)) {
    res.status(400).json("data missing");
    return;
  }

  const tokenUsername = await checkToken(token);
  if (tokenUsername === false) {
    if (!res.headersSent) res.status(401).json("wrong token");
    return;
  }

  const client = new Client({
    connectionString: process.env.DATABASE_STRING,
    connectionTimeoutMillis: 5000,
  });

  try {
    await client.connect();

    const web_push_query = await client.query(
      `SELECT id FROM subscribe_web_push WHERE username = $1`,
      [tokenUsername]
    );

    const insertNewWebPush = async () => {
      await client
        .query(
          `INSERT INTO subscribe_web_push (username, endpoint, p256dh, auth)
     VALUES ($1, $2, $3, $4)`,
          [
            tokenUsername,
            pushSubscriptionJSON.endpoint,
            pushSubscriptionJSON.keys.p256dh,
            pushSubscriptionJSON.keys.auth,
          ]
        )
        .then(() => res.send("added"))
        .catch((err) => res.status(400).json(err));
    };

    const updateWebPush = async () => {
      await client
        .query(
          `UPDATE subscribe_web_push SET endpoint=$1, p256dh=$2, auth=$3 WHERE username = $4`,
          [
            pushSubscriptionJSON.endpoint,
            pushSubscriptionJSON.keys.p256dh,
            pushSubscriptionJSON.keys.auth,
            tokenUsername,
          ]
        )
        .then(() => res.send("updated"))
        .catch((err) => {
          res.status(400).json(err);
          console.log(err);
        });
    };

    if (web_push_query.rowCount > 0) updateWebPush();
    else insertNewWebPush();
  } catch (err) {
    if (client?.connected) client.end().catch(() => {});
    if (!res.headersSent) res.status(500).json(err);
  } finally {
    if (client?.connected) client.end().catch(() => {});
  }
};

module.exports = SubscribeWebPush;
