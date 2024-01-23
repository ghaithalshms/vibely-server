const CheckTokenNoDB = require("../../func/check_token_no_db");
const { Client } = require("pg");
require("dotenv").config();

const SetNotificationSeen = async (req, res) => {
  const { token } = req.body;

  const client = new Client({
    connectionString: process.env.DATABASE_STRING,
    connectionTimeoutMillis: 5000,
  });
  client.on("error", (err) => {
    console.log("postgres erR:", err);
  });

  try {
    if (!token)
      if (!res.headersSent) {
        res.status(400).json("missing data");
        return;
      }

    const tokenUsername = await CheckTokenNoDB(token);
    if (tokenUsername === false) {
      if (!res.headersSent) res.status(401).json("wrong token");
      return;
    }

    await client.connect();

    const handleSetNotificationSeen = async () => {
      await client.query(
        `UPDATE notification_tbl SET seen=true WHERE noti_to=$1`,
        [tokenUsername]
      );
      if (!res.headersSent) res.status(200).json("seen");
    };
    handleSetNotificationSeen();
  } catch (err) {
    if (client?.connected) client.end().catch(() => {});
    console.error("unexpected error : ", err);
    res.status(500).json(err);
  } finally {
    if (client?.connected) client.end().catch(() => {});
  }
};

module.exports = SetNotificationSeen;
