const CheckTokenNoDB = require("../../func/check_token_no_db");
const { Client } = require("pg");
require("dotenv").config();

const setMessagesSeen = async (client, tokenUsername, username) => {
  await client.query(
    `UPDATE message_tbl SET seen=true WHERE msg_from=$1 AND msg_to=$2`,
    [username, tokenUsername]
  );
};

const SetMessagesSeen = async (req, res) => {
  const { token, username } = req.body;
  const client = new Client({ connectionString: process.env.DATABASE_STRING });
  client.on("error", (err) =>
    console.error("something bad has happened!", err.stack)
  );
  await client.connect();

  try {
    if (!(token && username)) {
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

    await setMessagesSeen(client, tokenUsername, username);
    if (!res.headersSent) {
      res.status(200).json("seen");
    }
  } catch (err) {
    console.log("unexpected error : ", err);
    res.status(500).json(err);
  } finally {
    await client?.end();
  }
};

module.exports = SetMessagesSeen;
