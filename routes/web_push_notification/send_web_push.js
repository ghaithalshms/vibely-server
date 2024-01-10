const webpush = require("web-push");
require("dotenv").config();
const { Client } = require("pg");

const SendWebPush = async (messageData) => {
  const client = new Client({
    connectionString: process.env.DATABASE_STRING,
    connectionTimeoutMillis: 5000,
  });
  try {
    webpush.setVapidDetails(
      `mailto:${process.env.ZOHO_EMAIL}`,
      process.env.WEB_PUSH_PUBLIC_KEY,
      process.env.WEB_PUSH_PRIVATE_KEY
    );

    await client.connect();

    const web_push_query = await client.query(
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
  } catch (err) {
    if (client.connected) client.end().catch(() => {});
    if (!res.headersSent) res.status(500).json(err);
  } finally {
    if (client.connected) client.end().catch(() => {});
  }
};

module.exports = SendWebPush;
