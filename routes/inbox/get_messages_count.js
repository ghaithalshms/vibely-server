const CheckTokenNoDB = require("../../func/check_token_no_db");
const { Client } = require("pg");
require("dotenv").config();

const getMessagesCount = async (client, tokenUsername) => {
  const countQuery = await client.query(
    `SELECT COUNT(DISTINCT msg_from) AS unseen_count
    FROM message_tbl
    WHERE msg_to = $1 AND seen = false;
  `,
    [tokenUsername]
  );
  return countQuery.rows[0].unseen_count;
};

const GetMessagesCount = async (req, res) => {
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

    const count = await getMessagesCount(client, tokenUsername);
    if (!res.headersSent) {
      res.send(count);
    }
  } catch (err) {
    console.log("unexpected error : ", err);
    res.status(500).json(err);
  } finally {
    client?.end();
  }
};

module.exports = GetMessagesCount;
