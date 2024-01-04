const CheckTokenNoDB = require("../../func/check_token_no_db");
const { Pool } = require("pg");
require("dotenv").config();

const SetMessagesSeen = async (req, res) => {
  const { token, username } = req.body;

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

  const pool = new Pool({
    connectionString: process.env.DATABASE_STRING,
    connectionTimeoutMillis: 5000,
  });

  const handleSetMessagesSeen = async () => {
    await pool.query(
      `UPDATE message_tbl SET seen=true WHERE msg_from=$1 AND msg_to=$2`,
      [username, tokenUsername]
    );
    if (!res.headersSent) res.status(200).json("seen");
  };
  handleSetMessagesSeen();
};

module.exports = SetMessagesSeen;
