const checkToken = require("../../../func/check_token");
const pool = require("../../../pg_pool");

require("dotenv").config();

const GetUserFollowing = async (req, res) => {
  const { username, token } = req.query;
  const client = await pool.connect().catch((err) => console.log(err));

  try {
    if (!username) {
      res.status(400).json("data missing");
      return;
    }

    const tokenUsername = await checkToken(token);
    if (tokenUsername === false) {
      if (!res.headersSent) res.json("wrong token");
      return;
    }

    const userListQuery = await client.query(
      `SELECT DISTINCT u.username, u.first_name, u.last_name, u.admin, u.verified, 
      f2.follow_id, fr.req_id
      FROM user_tbl u
      JOIN follow_tbl f1 ON u.username = f1.following AND f1.follower = $1
      LEFT JOIN follow_tbl f2 ON u.username = f2.following AND f2.follower = $2
      LEFT JOIN follow_request_tbl fr ON u.username = fr.req_following AND fr.req_follower = $2`,
      [username, tokenUsername]
    );

    let userList = [];

    for (const user of userListQuery.rows) {
      userList.push({
        username: user.username,
        firstName: user.first_name ?? "",
        lastName: user.last_name ?? "",
        isFollowing: user.follow_id > 0,
        isFollowRequested: user.req_id > 0,
        isVerified: user.verified ?? false,
        isAdmin: user.admin ?? false,
      });
    }

    if (!res.headersSent) res.send(userList);
  } catch (err) {
    console.log("unexpected error : ", err);
    res.status(500).json(err);
  } finally {
    client?.release();
  }
};

module.exports = GetUserFollowing;
