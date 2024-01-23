const CheckTokenNoDB = require("../../func/check_token_no_db");
const { Client } = require("pg");
require("dotenv").config();

const GetNotificationCount = async (req, res) => {
  const { token } = req.query;

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

    const handleGetNotificationCount = async () => {
      const countQuery = await client.query(
        `SELECT COUNT(seen) 
        FROM notification_tbl 
        WHERE noti_to=$1 AND seen=false`,
        [tokenUsername]
      );
      if (!res.headersSent) res.send(countQuery.rows[0].count);
    };
    handleGetNotificationCount();
  } catch (err) {
    if (client?.connected) client.end().catch(() => {});
    console.error("unexpected error : ", err);
    res.status(500).json(err);
  } finally {
    if (client?.connected) client.end().catch(() => {});
  }
};

module.exports = GetNotificationCount;
