const _pool = require("../../../pg_pool");

require("dotenv").config();

const GetUserFollowing = async (req, res) => {
  const { username } = req.query;

  try {
    if (!username) {
      res.status(400).json("data missing");
      return;
    }
    const userListQuery = await _pool.query(
      `SELECT DISTINCT username, first_name, last_name, admin, verified, last_seen FROM user_tbl, follow_tbl WHERE username=following AND follower=$1`,
      [username]
    );

    let userList = [];

    for (const user of userListQuery.rows) {
      userList.push({
        username: user.username ?? "",
        firstName: user.first_name ?? "",
        lastName: user.last_name ?? "",
        picture: null,
        isFollowing: true,
        isFollowRequested: false,
        isVerified: user.verified ?? false,
        isAdmin: user.admin ?? false,
        lastSeen: user.last_seen,
      });
    }

    if (!res.headersSent) res.send(userList);
  } catch (err) {
    console.log("unexpected error : ", err);
    res.status(500).json(err);
  }
};

module.exports = GetUserFollowing;
