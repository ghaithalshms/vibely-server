const checkToken = require("../../func/check_token");
const _pool = require("../../pg_pool");
require("dotenv").config();

const GetChat = async (req, res) => {
  const { token, username } = req.query;

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

    const chatQuery = await _pool.query(
      `SELECT msg_id, message, msg_from, msg_to, sent_date, seen, file_type FROM message_tbl
    WHERE (msg_to = $1 AND msg_from = $2) 
    OR (msg_to = $2 AND msg_from = $1)
    ORDER BY msg_id DESC
    
    `,
      [tokenUsername, username]
    );

    let chatList = [];

    for (const chat of chatQuery.rows.reverse()) {
      chatList.push({
        id: chat.msg_id,
        message: chat.message,
        from: chat.msg_from,
        to: chat.msg_to,
        sentDate: chat.sent_date,
        file: chat.file,
        fileType: chat.file_type,
        seen: chat.seen,
      });
    }
    if (!res.headersSent) res.send(chatList);
  } catch (err) {
    console.log("unexpected error : ", err);
    res.status(500).json(err);
  }
};

module.exports = GetChat;
