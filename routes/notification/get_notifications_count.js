const CheckTokenNoDB = require("../../func/check_token_no_db");
const { Client } = require("pg");
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
  const client = new Client({ connectionString: process.env.DATABASE_STRING });
  await client.connect();

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
    await client?.end();
  }
};

module.exports = GetNotificationCount;
