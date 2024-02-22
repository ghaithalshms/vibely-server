require("dotenv").config();

const checkToken = require("../../func/check_token");
const _pool = require("../../pg_pool");
require("dotenv").config();

const SubscribeWebPush = async (req, res) => {
  const { token, pushSubscription, browserID } = req.body;

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

  try {
    const web_push_query = await _pool.query(
      `SELECT id FROM subscribe_web_push WHERE username = $1 AND browser_id = $2`,
      [tokenUsername, browserID]
    );

    const insertNewWebPush = async () => {
      await _pool
        .query(
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
        )
        .then(() => res.send("added"))
        .catch((err) => res.status(400).json(err));
    };

    const updateWebPush = async () => {
      await _pool
        .query(
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
    if (!res.headersSent) res.status(500).json(err);
  }
};

module.exports = SubscribeWebPush;
