require("dotenv").config();

const checkToken = require("../func/check_token");
const { Pool } = require("pg");

const insertNewWebPush = async (
  client,
  tokenUsername,
  pushSubscriptionJSON,
  browserID,
  res
) => {
  await client.query(
    `INSERT INTO subscribe_web_push 
    (username, endpoint, p256dh, auth, browser_id, last_used_time)
    VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      tokenUsername,
      pushSubscriptionJSON.endpoint,
      pushSubscriptionJSON.keys.p256dh,
      pushSubscriptionJSON.keys.auth,
      browserID,
      new Date().toISOString(),
    ]
  );
  res.send("added");
};

const updateWebPush = async (
  client,
  tokenUsername,
  pushSubscriptionJSON,
  browserID,
  res
) => {
  await client.query(
    `UPDATE subscribe_web_push 
    SET endpoint=$1, p256dh=$2, auth=$3, last_used_time = $4
    WHERE username = $5 AND browser_id = $6`,
    [
      pushSubscriptionJSON.endpoint,
      pushSubscriptionJSON.keys.p256dh,
      pushSubscriptionJSON.keys.auth,
      new Date().toISOString(),
      tokenUsername,
      browserID,
    ]
  );
  res.send("updated");
};

const SubscribeWebPush = async (req, res) => {
  const { token, pushSubscription, browserID } = req.body;
  const pushSubscriptionJSON = JSON.parse(pushSubscription);

  if (!(token && pushSubscriptionJSON && browserID)) {
    res.status(400).json("data missing");
    return;
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_STRING });
  const client = await pool.connect().catch((err) => {
    console.log(err);
    res.status(500).json(err);
  });
  client.on("error", (err) =>
    console.error("something bad has happened!", err.stack)
  );

  try {
    const tokenUsername = await checkToken(token);

    if (tokenUsername === false) {
      res.status(401).json("wrong token");
      return;
    }

    const web_push_query = await client.query(
      `SELECT id FROM subscribe_web_push WHERE username = $1 AND browser_id = $2`,
      [tokenUsername, browserID]
    );

    if (web_push_query.rowCount > 0) {
      await updateWebPush(
        client,
        tokenUsername,
        pushSubscriptionJSON,
        browserID,
        res
      );
    } else {
      await insertNewWebPush(
        client,
        tokenUsername,
        pushSubscriptionJSON,
        browserID,
        res
      );
    }
  } catch (err) {
    console.log("unexpected error : ", err);
    res.status(500).json(err);
  } finally {
    await client?.release();
  }
};

module.exports = SubscribeWebPush;
