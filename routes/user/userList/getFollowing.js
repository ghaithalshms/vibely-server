const { Pool } = require("pg");
require("dotenv").config();

const GetUserFollowing = async (req, res) => {
  const { username } = req.query;
  try {
    if (!username) {
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

    // async function handleCheckIfFollowing(username) {
    //   const isFollowingQuery = await pool.query(
    //     "SELECT * FROM follow_tbl WHERE follower = $1 AND following = $2",
    //     [userSigned, username]
    //   );
    //   return isFollowingQuery.rows.length > 0;
    // }

    // async function handleCheckIfFollowRequested(username) {
    //   const isFollowRequestedQuery = await pool.query(
    //     "SELECT * FROM follow_request_tbl WHERE req_follower = $1 AND req_following = $2",
    //     [userSigned, username]
    //   );
    //   return isFollowRequestedQuery.rows.length > 0;
    // }

    const userListQuery = await pool.query(
      `SELECT DISTINCT username, first_name, last_name, picture, admin, verified FROM user_tbl, follow_tbl WHERE username=following AND follower=$1`,
      [username]
    );

    let userList = [];

    for (const user of userListQuery.rows) {
      // const isFollowing = await handleCheckIfFollowing(user.username);
      // const isFollowRequested = await handleCheckIfFollowRequested(
      //   user.username
      // );
      userList.push({
        username: user.username ?? "",
        firstName: user.first_name ?? "",
        lastName: user.last_name ?? "",
        picture: user.picture ?? null,
        // isFollowing,
        // isFollowRequested,
        isVerified: user.verified ?? false,
        isAdmin: user.admin ?? false,
      });
    }

    if (!res.headersSent) res.send(userList);
  } catch (error) {
    if (!res.headersSent) res.status(400).json(error.message);
  }
};

module.exports = GetUserFollowing;
