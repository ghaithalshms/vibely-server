require("dotenv").config();
const checkToken = require("../../func/check_token");
const pool = require("../../pg_pool");

const GetNotifications = async (req, res) => {
  const { token } = req.query;
  const client = await pool.connect().catch((err) => console.log(err));
  client.on("error", (err) => console.log(err));
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

    const notificationQuery = await client.query(
      `SELECT noti_from, noti_to, noti_type, noti_date, 
      username, first_name, verified, admin
      FROM user_tbl, notification_tbl
      WHERE noti_to = $1
      AND noti_from = username
      AND noti_from != $1
      ORDER BY noti_id DESC
      LIMIT 10`,
      [tokenUsername]
    );

    let notificationList = [];

    for (const noti of notificationQuery.rows) {
      notificationList.push({
        user: {
          username: noti.username ?? "",
          firstName: noti.first_name ?? "",
          picture: null,
          isAdmin: noti.admin ?? false,
          isVerified: noti.verified ?? false,
        },
        notification: {
          from: noti.noti_from ?? "",
          type: noti.noti_type ?? "",
          date: noti.noti_date ?? "",
        },
      });
    }
    if (!res.headersSent) res.send(notificationList);
  } catch (err) {
    console.log("unexpected error : ", err);
    res.status(500).json(err);
  } finally {
    client?.release();
  }
};

module.exports = GetNotifications;
