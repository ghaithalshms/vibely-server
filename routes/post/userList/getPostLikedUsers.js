const { Pool } = require("pg");
require("dotenv").config();

const GetPostLikedUsers = async (req, res) => {
  const { postID } = req.query;
  try {
    if (!postID) {
      res.status(404).json("data missing");
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

    const userListQuery = await pool.query(
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
  } catch (error) {
    if (!res.headersSent) res.status(400).json(error.message);
  }
};

module.exports = GetPostLikedUsers;
