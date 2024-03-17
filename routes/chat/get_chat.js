const checkToken = require("../../func/check_token");
const pool = require("../../pg_pool");
require("dotenv").config();

const GetChat = async (req, res) => {
  const { token, username } = req.query;
  const client = await pool.connect().catch((err) => console.log(err));
  client.on("error", (err) => console.log(err));

  try {
    if (!(token && username)) {
      res.status(400).json("data missing");
      return;
    }
    const tokenUsername = await checkToken(token);
    if (tokenUsername === false) {
      if (!res.headersSent) res.status(401).json("wrong token");
      return;
    }

    const chatQuery = await client?.query(
      `SELECT msg_id, message, msg_from, msg_to, sent_date, seen, file_type FROM message_tbl
    WHERE (msg_to = $1 AND msg_from = $2) 
    OR (msg_to = $2 AND msg_from = $1)
    ORDER BY msg_id DESC
    LIMIT 50
    `,
      [tokenUsername, username]
    );

    let chatList = [];

    for (const message of chatQuery.rows.reverse()) {
      chatList.push({
        id: message.msg_id,
        message: message.message,
        from: message.msg_from,
        to: message.msg_to,
        sentDate: message.sent_date,
        fileType: message.file_type,
        seen: message.seen,
      });
    }
    if (!res.headersSent) res.send(chatList);
  } catch (err) {
    console.log("unexpected error : ", err);
    res.status(500).json(err);
  } finally {
    client?.release();
  }
};

module.exports = GetChat;
