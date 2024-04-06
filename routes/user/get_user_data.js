const { Client } = require("pg");
const CheckTokenNoDB = require("../../func/check_token_no_db");
require("dotenv").config();

const GetUserData = async (req, res, connectedUsers) => {
  const { username, token } = req.query;

  if (!(username && token)) {
    return res.status(400).json("Data missing");
  }

  const client = new Client({ connectionString: process.env.DATABASE_STRING });
  client.on("error", (err) =>
    console.error("something bad has happened!", err.stack)
  );
  await client.connect();

  try {
    const tokenUsername = await verifyToken(token);

    if (!tokenUsername) {
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
    await client?.end();
  }
};

const handleError = (res) => (err) => {
  console.error("Unexpected error:", err);
  res.status(500).json(err);
};

const verifyToken = async (token) => {
  return await CheckTokenNoDB(token);
};

const fetchUserData = async (
  client,
  requestedUsername,
  tokenUsername,
  connectedUsers
) => {
  const dataQuery = await client.query(
    `SELECT username, first_name, last_name, post_count, follower_count, 
    following_count, biography, link, privacity, verified, admin, 
    follow_id, req_id, last_seen
    FROM user_tbl u
    LEFT JOIN follow_tbl f ON f.follower = $1 AND f.following = u.username
    LEFT JOIN follow_request_tbl fr ON fr.req_follower = $2 AND fr.req_following = u.username
    WHERE u.username = $3`,
    [tokenUsername, tokenUsername, requestedUsername]
  );

  if (dataQuery.rows.length > 0 && tokenUsername !== requestedUsername) {
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
