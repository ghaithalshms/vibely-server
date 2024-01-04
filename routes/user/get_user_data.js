const { Pool } = require("pg");
require("dotenv").config();

const getUserData = async (req, res) => {
  const { username, userSigned } = req.query;
  try {
    if (!(username && userSigned)) {
      res.status(400).json("data missing");
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
    const dataQuery = await pool.query(
      "SELECT * FROM user_tbl WHERE username = $1",
      [username]
    );
    const isFollowingQuery = await pool.query(
      "SELECT * FROM follow_tbl WHERE follower = $1 AND following = $2",
      [userSigned, username]
    );
    const isFollowRequestedQuery = await pool.query(
      "SELECT * FROM follow_request_tbl WHERE req_follower = $1 AND req_following = $2",
      [userSigned, username]
    );
    if (dataQuery.rows.length > 0) {
      const userData = {
        username: dataQuery.rows[0].username ?? "",
        firstName: dataQuery.rows[0].first_name ?? "",
        lastName: dataQuery.rows[0].last_name ?? "",
        postCount: dataQuery.rows[0].post_count ?? 0,
        followerCount: dataQuery.rows[0].follower_count ?? 0,
        followingCount: dataQuery.rows[0].following_count ?? 0,
        biography: dataQuery.rows[0].biography ?? "",
        picture: dataQuery.rows[0].picture ?? "",
        link: dataQuery.rows[0].link ?? "",
        privacity: dataQuery.rows[0].privacity ?? false,
        isFollowing: isFollowingQuery.rows.length > 0,
        isFollowRequested: isFollowRequestedQuery.rows.length > 0,
        isVerified: dataQuery.rows[0].verified ?? false,
        isAdmin: dataQuery.rows[0].admin ?? false,
      };
      if (!res.headersSent) res.send(userData);
    } else {
      if (!res.headersSent) res.status(404).json("User not found");
    }
  } catch (error) {
    if (!res.headersSent) res.status(400).json(error.message);
  }
};

module.exports = getUserData;