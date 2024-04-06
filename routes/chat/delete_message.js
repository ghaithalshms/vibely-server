const CheckTokenNoDB = require("../../func/check_token_no_db");
const { Pool } = require("pg");

require("dotenv").config();

const DeleteMessageFromDB = async (req, res) => {
  const { token, messageID } = req.body;
  const pool = new Pool({ connectionString: process.env.DATABASE_STRING });
  const client = await pool.connect();
  client.on("error", (err) =>
    console.error("something bad has happened!", err.stack)
  );

  try {
    if (!(token && messageID))
      if (!res.headersSent) {
        return res.status(400).json("missing data");
      }
    const tokenUsername = await CheckTokenNoDB(token);
    if (tokenUsername === false) {
      if (!res.headersSent) return res.status(401).json("wrong token");
    }
    verifyMessageSentByUser(client, messageID, tokenUsername).then(
      async (isMsgSentByUser) => {
        if (isMsgSentByUser) {
          await deleteMessageFromDB(client, messageID);
          if (!res.headersSent) res.status(200).json(result);
        } else {
          if (!res.headersSent)
            res.status(400).json("This message sas not sent by you!");
        }
      }
    );
  } catch (err) {
    console.log("unexpected error : ", err);
    res.status(500).json(err);
  } finally {
    await client?.release();
  }
};

module.exports = DeleteMessageFromDB;

async function verifyMessageSentByUser(client, tokenUsername, messageID) {
  const result = await client.query(
    "SELECT msg_id, msg_from FROM message_tbl WHERE msg_id = $1 AND msg_from = $2",
    [messageID, tokenUsername]
  );
  return result.rows.count > 0;
}

async function deleteMessageFromDB(client, messageID) {
  await client.query("DELETE FROM message_tbl WHERE msg_id = $1", [messageID]);
}
