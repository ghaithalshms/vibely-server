const { Pool } = require("pg");
const CheckTokenNoDB = require("../../func/check_token_no_db");
require("dotenv").config();

const GetUserData = async (req, res, connectedUsers) => {
  const { username, token } = req.query;

  if (!username) {
    return res.status(400).json("Data missing");
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_STRING });
  const client = await pool.connect().catch((err) => {
    console.log(err);
    res.status(500).json(err);
  });
  client.on("error", (err) =>
    console.error("something bad has happened!", err.stack)
  );

  try {
    let tokenUsername;
    if (token) {
      tokenUsername = await CheckTokenNoDB(token);
    }

    if (token && !tokenUsername) {
      return res.status(401).json("Invalid token");
    }

    const userData = await fetchUserData(
      client,
      username,
      tokenUsername,
      connectedUsers
    );

    if (!userData) {
      return res.status(404).json("User not found");
    }

    res.send(userData);
  } catch (err) {
    handleError(res)(err);
  } finally {
    await client?.release();
  }
};

const handleError = (res) => (err) => {
  console.error("Unexpected error:", err);
  res.status(500).json(err);
};

const fetchUserData = async (
  client,
  requestedUsername,
  tokenUsername,
  connectedUsers
) => {
  let query, params;

  if (tokenUsername) {
    query = `
    SELECT username, first_name, last_name, post_count, follower_count, 
    following_count, biography, link, privacity, verified, admin, last_seen,
    follow_id, req_id
    FROM user_tbl u
    LEFT JOIN follow_tbl f ON f.follower = $1 AND f.following = u.username
    LEFT JOIN follow_request_tbl fr ON fr.req_follower = $2 AND fr.req_following = u.username
    WHERE u.username = $2`;
    params = [tokenUsername, requestedUsername];
  } else {
    query = `
    SELECT username, first_name, last_name, post_count, follower_count, 
    following_count, biography, link, privacity, verified, admin, last_seen
    FROM user_tbl u
    WHERE u.username = $1`;
    params = [requestedUsername];
  }

  const dataQuery = await client.query(query, params);

  if (
    tokenUsername &&
    dataQuery.rows.length > 0 &&
    tokenUsername !== requestedUsername
  ) {
    await client.query(
      `INSERT INTO profile_views_tbl (viewer_user, viewed_user, viewed_time) VALUES ($1,$2,$3)`,
      [tokenUsername, requestedUsername, new Date().toISOString()]
    );
  }

  return extractUserData(dataQuery.rows[0], connectedUsers, requestedUsername);
};

const extractUserData = (userData, connectedUsers, requestedUsername) => {
  if (!userData) return null;

  return {
    username: userData.username,
    firstName: userData.first_name ?? "",
    lastName: userData.last_name ?? "",
    postCount: userData.post_count,
    followerCount: userData.follower_count,
    followingCount: userData.following_count,
    biography: userData.biography ?? "",
    link: userData.link ?? "",
    privacity: userData.privacity ?? false,
    isFollowing: userData.follow_id > 0,
    isFollowRequested: userData.req_id > 0,
    isVerified: userData.verified ?? false,
    isAdmin: userData.admin ?? false,
    lastSeen: connectedUsers.has(requestedUsername)
      ? "online"
      : userData.last_seen,
  };
};

module.exports = GetUserData;
