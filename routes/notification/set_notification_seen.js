const CheckTokenNoDB = require("../../func/check_token_no_db");
const { Pool } = require("pg");
require("dotenv").config();

const SetNotificationSeen = async (req, res) => {
  const { token } = req.body;

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

  const pool = new Pool({
    connectionString: process.env.DATABASE_STRING,
    connectionTimeoutMillis: 5000,
  });

  const handleSetNotificationSeen = async () => {
    await pool.query(`UPDATE notification_tbl SET seen=true WHERE noti_to=$1`, [
      tokenUsername,
    ]);
    if (!res.headersSent) res.status(200).json("seen");
  };
  handleSetNotificationSeen();
};

module.exports = SetNotificationSeen;
