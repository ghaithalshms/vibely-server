const CheckTokenNoDB = require("../../func/check_token_no_db");
const { Client } = require("pg");
require("dotenv").config();

const SetMessagesSeen = async (req, res) => {
  const { token, username } = req.body;
  const client = new Client({
    connectionString: process.env.DATABASE_STRING,
    connectionTimeoutMillis: 5000,
  });
  try {
    if (!(token && username))
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

    const handleSetMessagesSeen = async () => {
      await client.query(
        `UPDATE message_tbl SET seen=true WHERE msg_from=$1 AND msg_to=$2`,
        [username, tokenUsername]
      );
      if (!res.headersSent) res.status(200).json("seen");
    };
    handleSetMessagesSeen();
  } catch (err) {
    if (client.connected) client.end().catch(() => {});
    console.error("unexpected error : ", err);
    res.status(500).json(err);
  } finally {
    if (client.connected) client.end().catch(() => {});
  }
};

module.exports = SetMessagesSeen;
