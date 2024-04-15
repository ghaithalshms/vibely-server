const checkToken = require("../../func/check_token");
const { Pool } = require("pg");
require("dotenv").config();

const getInboxUsers = async (client, tokenUsername) => {
  return await client.query(
    `SELECT 
      u.username,
      u.first_name,
      u.last_name,
      u.verified,
      u.admin,
      u.last_seen,
      m.msg_id,
      m.msg_from,
      m.msg_to,
      m.sent_date,
      m.file_type,
      m.message,
      m.seen
    FROM user_tbl u
    JOIN message_tbl m ON (
      (m.msg_to = u.username AND m.msg_from = $1) 
      OR
      (m.msg_from = u.username AND m.msg_to = $1)
    )
    WHERE m.sent_date = (
      SELECT MAX(sent_date)
      FROM message_tbl
      WHERE ($1 IN (msg_from, msg_to) AND 
             (msg_from = u.username OR msg_to = u.username))
    )
    ORDER BY m.sent_date DESC;
  `,
    [tokenUsername]
  );
};

const formatInboxUsers = (inboxUsersArray, connectedUsers) => {
  let inboxList = [];

  for (const inbox of inboxUsersArray.rows) {
    let shortMessage = inbox.message?.slice(0, 30);
    shortMessage =
      shortMessage?.length < inbox.message?.length
        ? shortMessage + "..."
        : shortMessage;
    inboxList.push({
      user: {
        username: inbox.username,
        firstName: inbox.first_name ?? "",
        lastName: inbox.last_name ?? "",
        isVerified: inbox.verified ?? false,
        isAdmin: inbox.admin ?? false,
        lastSeen: connectedUsers.has(inbox.username)
          ? "online"
          : inbox.last_seen,
      },
      message: {
        id: inbox.msg_id,
        message: shortMessage,
        from: inbox.msg_from,
        to: inbox.msg_to,
        sentDate: inbox.sent_date,
        fileType: inbox.file_type,
        seen: inbox.seen,
      },
    });
  }

  return inboxList;
};

const GetInbox = async (req, res, connectedUsers) => {
  const { token } = req.query;
  const pool = new Pool({ connectionString: process.env.DATABASE_STRING });
  const client = await pool.connect().catch((err) => {
    console.log(err);
    res.status(500).json(err);
  });
  client.on("error", (err) =>
    console.error("something bad has happened!", err.stack)
  );

  try {
    if (!token) {
      res.status(401).json("data missing");
      return;
    }
    const tokenUsername = await checkToken(token);
    if (tokenUsername === false) {
      if (!res.headersSent) res.status(401).json("wrong token");
      return;
    }

    const inboxUsersArray = await getInboxUsers(client, tokenUsername);
    const inboxList = formatInboxUsers(inboxUsersArray, connectedUsers);

    if (!res.headersSent) res.send(inboxList);
  } catch (error) {
    if (!res.headersSent) res.status(400).json(error.message);
  } finally {
    await client?.release();
  }
};

module.exports = GetInbox;
