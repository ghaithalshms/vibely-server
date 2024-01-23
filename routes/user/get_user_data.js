const { Client } = require("pg");
require("dotenv").config();

const getUserData = async (req, res) => {
  const { username, userSigned } = req.query;
  const client = new Client({
    connectionString: process.env.DATABASE_STRING,
    connectionTimeoutMillis: 30000,
  });
  client.on("error", (err) => {
    console.log("postgres erR:", err);
  });

  try {
    if (!(username && userSigned)) {
      res.status(400).json("data missing");
      return;
    }

    await client.connect();

    const dataQuery = await client.query(
      `SELECT username, first_name, last_name, post_count, follower_count, 
      following_count, biography, link, privacity, verified, admin, 
      follow_id, req_id
FROM user_tbl u
LEFT JOIN follow_tbl f ON f.follower = $1 AND f.following = u.username
LEFT JOIN follow_request_tbl fr ON fr.req_follower = $2 AND fr.req_following = u.username
WHERE u.username = $2`,
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
        picture: null,
        link: dataQuery.rows[0].link ?? "",
        privacity: dataQuery.rows[0].privacity ?? false,
        isFollowing: dataQuery.rows[0].follow_id > 0,
        isFollowRequested: dataQuery.rows[0].req_id > 0,
        isVerified: dataQuery.rows[0].verified ?? false,
        isAdmin: dataQuery.rows[0].admin ?? false,
      };
      if (!res.headersSent) res.send(userData);
    } else {
      if (!res.headersSent) res.status(404).json("User not found");
    }
  } catch (err) {
    if (client?.connected) client.end().catch(() => {});
    console.error("unexpected error : ", err);
    res.status(500).json(err);
  } finally {
    if (client?.connected) client.end().catch(() => {});
  }
};

module.exports = getUserData;
