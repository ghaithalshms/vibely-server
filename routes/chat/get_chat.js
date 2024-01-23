const { Client } = require("pg");
const checkToken = require("../../func/check_token");
require("dotenv").config();

const GetChat = async (req, res) => {
  const { token, username } = req.query;
  const client = new Client({
    connectionString: process.env.DATABASE_STRING,
    connectionTimeoutMillis: 5000,
  });
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

    await client.connect();

    const chatQuery = await client.query(
      `SELECT DISTINCT * FROM message_tbl
    WHERE (msg_to = $1 AND msg_from = $2) 
       OR (msg_to = $2 AND msg_from = $1)
       ORDER BY msg_id`,
      [tokenUsername, username]
    );

    let chatList = [];

    for (const chat of chatQuery.rows) {
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
    if (client?.connected) client.end().catch(() => {});
    console.error("unexpected error : ", err);
    res.status(500).json(err);
  } finally {
    if (client?.connected) client.end().catch(() => {});
  }
};

module.exports = GetChat;
