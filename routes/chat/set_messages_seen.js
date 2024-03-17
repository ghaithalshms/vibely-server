const CheckTokenNoDB = require("../../func/check_token_no_db");
const pool = require("../../pg_pool");

require("dotenv").config();

const SetMessagesSeen = async (req, res) => {
  const { token, username } = req.body;
  const client = await pool.connect().catch((err) => console.log(err));
  client.on("error", (err) => console.log(err));

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

    const handleSetMessagesSeen = async () => {
      await client.query(
        `UPDATE message_tbl SET seen=true WHERE msg_from=$1 AND msg_to=$2`,
        [username, tokenUsername]
      );
      if (!res.headersSent) res.status(200).json("seen");
    };
    handleSetMessagesSeen();
  } catch (err) {
    console.log("unexpected error : ", err);
    res.status(500).json(err);
  } finally {
    client?.release();
  }
};

module.exports = SetMessagesSeen;
