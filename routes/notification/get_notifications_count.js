const CheckTokenNoDB = require("../../func/check_token_no_db");
const pool = require("../../pg_pool");
require("dotenv").config();

const getNotificationCount = async (client, tokenUsername) => {
  const countQuery = await client.query(
    `SELECT COUNT(seen) 
    FROM notification_tbl 
    WHERE noti_to=$1 AND seen=false`,
    [tokenUsername]
  );
  return countQuery.rows[0].count;
};

const GetNotificationCount = async (req, res) => {
  const { token } = req.query;
  const client = await pool.connect().catch((err) => console.log(err));

  try {
    if (!token) {
      if (!res.headersSent) {
        res.status(400).json("missing data");
        return;
      }
    }

    const tokenUsername = await CheckTokenNoDB(token);
    if (tokenUsername === false) {
      if (!res.headersSent) {
        res.status(401).json("wrong token");
        return;
      }
    }

    const count = await getNotificationCount(client, tokenUsername);
    if (!res.headersSent) {
      res.send(count);
    }
  } catch (err) {
    console.log("unexpected error : ", err);
    res.status(500).json(err);
  } finally {
    client?.release();
  }
};

module.exports = GetNotificationCount;
