const CheckTokenNoDB = require("../../func/check_token_no_db");
const pool = require("../../pg_pool");

require("dotenv").config();

const GetNotificationCount = async (req, res) => {
  const { token } = req.query;
  const client = await pool.connect().catch((err) => console.log(err));

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
    console.log("unexpected error : ", err);
    res.status(500).json(err);
  } finally {
    client?.release();
  }
};

module.exports = GetNotificationCount;
