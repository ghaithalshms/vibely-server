const checkToken = require("../../func/check_token");
const _pool = require("../../pg_pool");
require("dotenv").config();

const GetInbox = async (req, res) => {
  const { token } = req.query;

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

    const inboxUsersArray = await _pool.query(
      `SELECT 
    u.username,
    u.first_name,
    u.last_name,
    u.verified,
    u.admin,
    u.last_seen,
    f.follow_id,
    f.follower,
    f.following,
    m.msg_id,
    m.msg_from,
    m.msg_to,
    m.sent_date,
    m.file_type,
    m.message,
    m.seen
FROM 
    user_tbl u
JOIN 
    follow_tbl f ON u.username = f.following
LEFT JOIN 
    message_tbl m ON (f.following = m.msg_to OR f.following = m.msg_from)
               AND m.sent_date = (
                    SELECT MAX(sent_date) 
                    FROM message_tbl 
                    WHERE (msg_to = f.following AND msg_from = $1) OR (msg_from = f.following AND msg_to = $1)
                )
WHERE 
    f.follower = $1
ORDER BY u.last_seen DESC;
`,
      [tokenUsername]
    );

    let inboxList = [];

    for (const inbox of inboxUsersArray.rows) {
      inboxList.push({
        user: {
          username: inbox.username ?? "",
          firstName: inbox.first_name ?? "",
          lastName: inbox.last_name ?? "",
          picture: null,
          isVerified: inbox.verified ?? false,
          isAdmin: inbox.admin ?? false,
        },
        message: {
          id: inbox.msg_id,
          message: inbox.message,
          from: inbox.msg_from,
          to: inbox.msg_to,
          sentDate: inbox.sent_date,
          fileType: inbox.file_type,
          seen: inbox.seen,
        },
      });
    }
    if (!res.headersSent) res.send(inboxList);
  } catch (error) {
    if (!res.headersSent) res.status(400).json(error.message);
  }
};

module.exports = GetInbox;
