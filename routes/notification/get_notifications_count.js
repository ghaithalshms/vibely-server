const CheckTokenNoDB = require("../../func/check_token_no_db");
const { Pool } = require("pg");
require("dotenv").config();

const GetNotificationCount = async (req, res) => {
  const { token } = req.query;

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

  const handleGetNotificationCount = async () => {
    const countQuery = await pool.query(
      `SELECT COUNT(seen) FROM notification_tbl WHERE noti_to=$1 AND seen=false`,
      [tokenUsername]
    );
    if (!res.headersSent) res.send(countQuery.rows[0].count);
  };
  handleGetNotificationCount();
};

module.exports = GetNotificationCount;
