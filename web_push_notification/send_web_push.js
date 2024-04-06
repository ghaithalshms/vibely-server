const webpush = require("web-push");
const { Pool } = require("pg");
require("dotenv").config();

const SendWebPush = async (title, body, to) => {
  const pool = new Pool({ connectionString: process.env.DATABASE_STRING });
  const client = await pool.connect();
  client.on("error", (err) =>
    console.error("something bad has happened!", err.stack)
  );

  // SEND ONLY IF THE USER IS NOT CONNECT -> send_message.js
  try {
    webpush.setVapidDetails(
      `mailto:${process.env.ZOHO_EMAIL}`,
      process.env.WEB_PUSH_PUBLIC_KEY,
      process.env.WEB_PUSH_PRIVATE_KEY
    );

    const web_push_query = await client.query(
      `SELECT * FROM subscribe_web_push WHERE username = $1 ORDER BY id`,
      [to]
    );

    let pushedEndpoints = [];

    web_push_query.rows.forEach((web_push) => {
      if (!pushedEndpoints.includes(web_push?.endpoint)) {
        webpush
          .sendNotification(
            {
              endpoint: web_push?.endpoint,
              expirationTime: null,
              keys: {
                p256dh: web_push?.p256dh,
                auth: web_push?.auth,
              },
            },
            JSON.stringify({
              title,
              body,
            })
          )
          .catch((err) => console.log(err));
        pushedEndpoints.push(web_push?.endpoint);
      }
    });
  } catch (err) {
    console.log(err);
  } finally {
    await client?.release();
  }
};

module.exports = SendWebPush;
