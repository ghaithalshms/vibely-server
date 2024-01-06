const { Client } = require("pg");
require("dotenv").config();

const GetPostLikedUsers = async (req, res) => {
  const { postID } = req.query;
  const client = new Client({
    connectionString: process.env.DATABASE_STRING,
    connectionTimeoutMillis: 5000,
  });
  try {
    if (!postID) {
      res.status(400).json("data missing");
      return;
    }

    await client.connect();

    const userListQuery = await client.query(
      `SELECT DISTINCT username, first_name,last_name, picture, admin, verified 
      FROM user_tbl, post_like_tbl 
      WHERE username=liked_user AND liked_post=$1`,
      [postID]
    );

    let userList = [];

    for (const user of userListQuery.rows) {
      userList.push({
        username: user.username ?? "",
        firstName: user.first_name ?? "",
        lastName: user.last_name ?? "",
        picture: user.picture ?? null,
        isVerified: user.verified ?? false,
        isAdmin: user.admin ?? false,
      });
    }
    if (!res.headersSent) res.send(userList);
  } catch (err) {
    if (client.connected) client.end().catch(() => {});
    console.error("unexpected error : ", err);
    res.status(500).json(err);
  } finally {
    if (client.connected) client.end().catch(() => {});
  }
};

module.exports = GetPostLikedUsers;
