const _pool = require("../../../pg_pool");

require("dotenv").config();

const GetUserFollowers = async (req, res) => {
  const { username } = req.query;

  try {
    if (!username) {
      res.status(400).json("data missing");
      return;
    }

    const userListQuery = await _pool.query(
      `SELECT DISTINCT u.username, u.first_name, u.last_name, u.admin, u.verified, f2.following, fr.req_following
      FROM user_tbl u
      JOIN follow_tbl f1 ON u.username = f1.follower AND f1.following = $1
      LEFT JOIN follow_tbl f2 ON u.username = f2.following AND f2.follower = $1
      LEFT JOIN follow_request_tbl fr ON u.username = fr.req_following AND fr.req_follower = $1
      `,
      [username]
    );

    let userList = [];

    for (const user of userListQuery.rows) {
      const isFollowing = user.following;
      const isFollowRequested = user.req_following;
      userList.push({
        username: user.username,
        firstName: user.first_name ?? "",
        lastName: user.last_name ?? "",
        picture: null,
        isFollowing,
        isFollowRequested,
        isVerified: user.verified ?? false,
        isAdmin: user.admin ?? false,
      });
    }
    if (!res.headersSent) res.send(userList);
  } catch (err) {
    console.log("unexpected error : ", err);
    res.status(500).json(err);
  }
};

module.exports = GetUserFollowers;
