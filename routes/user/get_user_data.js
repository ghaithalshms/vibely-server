const pool = require("../../pg_pool");
const CheckTokenNoDB = require("../../func/check_token_no_db");
require("dotenv").config();

const GetUserData = async (req, res, connectedUsers) => {
  const { username, token } = req.query;
  const client = await pool.connect().catch((err) => console.log(err));

  try {
    if (!(username && token)) {
      res.status(400).json("data missing");
      return;
    }

    const tokenUsername = await CheckTokenNoDB(token);
    if (tokenUsername === false) {
      if (!res.headersSent) res.status(401).json("wrong token");
      return;
    }

    const dataQuery = await client.query(
      `SELECT username, first_name, last_name, post_count, follower_count, 
      following_count, biography, link, privacity, verified, admin, 
      follow_id, req_id, last_seen
FROM user_tbl u
LEFT JOIN follow_tbl f ON f.follower = $1 AND f.following = u.username
LEFT JOIN follow_request_tbl fr ON fr.req_follower = $2 AND fr.req_following = u.username
WHERE u.username = $2`,
      [tokenUsername, username]
    );

    if (tokenUsername !== username)
      await client.query(
        `INSERT INTO profile_views_tbl (viewer_user, viewed_user, viewed_time) VALUES ($1,$2,$3)`,
        [tokenUsername, username, new Date().toISOString()]
      );

    if (dataQuery.rows.length > 0) {
      const userData = {
        username: dataQuery.rows[0].username,
        firstName: dataQuery.rows[0].first_name ?? "",
        lastName: dataQuery.rows[0].last_name ?? "",
        postCount: dataQuery.rows[0].post_count ?? 0,
        followerCount: dataQuery.rows[0].follower_count ?? 0,
        followingCount: dataQuery.rows[0].following_count ?? 0,
        biography: dataQuery.rows[0].biography ?? "",
        link: dataQuery.rows[0].link ?? "",
        privacity: dataQuery.rows[0].privacity ?? false,
        isFollowing: dataQuery.rows[0].follow_id > 0,
        isFollowRequested: dataQuery.rows[0].req_id > 0,
        isVerified: dataQuery.rows[0].verified ?? false,
        isAdmin: dataQuery.rows[0].admin ?? false,
        lastSeen: connectedUsers.has(username)
          ? "online"
          : dataQuery.rows[0].last_seen,
      };
      if (!res.headersSent) res.send(userData);
    } else {
      if (!res.headersSent) res.status(404).json("User not found");
    }
  } catch (err) {
    console.error("unexpected error : ", err);
    res.status(500).json(err);
  } finally {
    client?.release();
  }
};

module.exports = GetUserData;
