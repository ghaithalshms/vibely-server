const webpush = require("web-push");
const _pool = require("../../pg_pool");
require("dotenv").config();

const SendWebPush = async (messageData) => {
  try {
    webpush.setVapidDetails(
      `mailto:${process.env.ZOHO_EMAIL}`,
      process.env.WEB_PUSH_PUBLIC_KEY,
      process.env.WEB_PUSH_PRIVATE_KEY
    );

    const web_push_query = await _pool.query(
      `SELECT * FROM subscribe_web_push WHERE username = $1`,
      [messageData.to]
    );

    const pushSubscription = {
      endpoint: web_push_query.rows[0].endpoint,
      expirationTime: null,
      keys: {
        p256dh: web_push_query.rows[0].p256dh,
        auth: web_push_query.rows[0].auth,
      },
    };

    webpush
      .sendNotification(
        pushSubscription,
        JSON.stringify({
          title: messageData.from,
          message: messageData.message,
        })
      )
      .catch((err) => console.log(err));
  } catch (err) {}
};

module.exports = SendWebPush;
