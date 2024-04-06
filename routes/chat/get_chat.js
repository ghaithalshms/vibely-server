const checkToken = require("../../func/check_token");
const { Client } = require("pg");
require("dotenv").config();

const getChatMessages = async (client, tokenUsername, otherUsername) => {
  return await client.query(
    `SELECT msg_id, message, msg_from, msg_to, sent_date, seen, file_type FROM message_tbl
    WHERE (msg_to = $1 AND msg_from = $2) 
    OR (msg_to = $2 AND msg_from = $1)
    ORDER BY msg_id DESC
    LIMIT 50
  `,
    [tokenUsername, otherUsername]
  );
};

const formatChatMessages = (chatQuery) => {
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
  return chatList;
};

const GetChat = async (req, res) => {
  const { token, username } = req.query;
  const client = new Client({ connectionString: process.env.DATABASE_STRING });
  await client.connect();

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

    const chatQuery = await getChatMessages(client, tokenUsername, username);
    const chatList = formatChatMessages(chatQuery);

    if (!res.headersSent) res.send(chatList);
  } catch (err) {
    console.log("unexpected error : ", err);
    res.status(500).json(err);
  } finally {
    await client?.end();
  }
};

module.exports = GetChat;
