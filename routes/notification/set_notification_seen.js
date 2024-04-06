const CheckTokenNoDB = require("../../func/check_token_no_db");
const { Client } = require("pg");
require("dotenv").config();

const setNotificationsSeen = async (client, tokenUsername) => {
  await client.query(`UPDATE notification_tbl SET seen=true WHERE noti_to=$1`, [
    tokenUsername,
  ]);
};

const SetNotificationSeen = async (req, res) => {
  const { token } = req.body;
  const client = new Client({ connectionString: process.env.DATABASE_STRING });
  client.on("error", (err) =>
    console.error("something bad has happened!", err.stack)
  );
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

    await setNotificationsSeen(client, tokenUsername);
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

module.exports = SetNotificationSeen;
