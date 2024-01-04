const { Pool } = require("pg");
require("dotenv").config();
const checkToken = require("../../func/check_token");

const GetNotifications = async (req, res) => {
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
    const pool = new Pool({
      connectionString: process.env.DATABASE_STRING,
      connectionTimeoutMillis: 5000,
    });
    await pool
      .connect()
      .then()
      .catch(() => {
        if (!res.headersSent) res.status(502).json("DB connection error");
        return;
      });

    const notificationQuery = await pool.query(
      `SELECT noti_from, noti_to, noti_type, noti_date, 
      username, first_name, picture, verified, admin
      FROM user_tbl, notification_tbl
      WHERE noti_to = $1
      AND noti_from = username
      AND noti_from != $1
      ORDER BY noti_id DESC`,
      [tokenUsername]
    );

    let notificationList = [];

    for (const noti of notificationQuery.rows) {
      notificationList.push({
        user: {
          username: noti.username ?? "",
          firstName: noti.first_name ?? "",
          picture: noti.picture ?? null,
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
  } catch (error) {
    if (!res.headersSent) res.status(400).json(error.message);
  }
};

module.exports = GetNotifications;
