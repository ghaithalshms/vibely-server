const checkToken = require("../../../func/check_token");
const { Pool } = require("pg");

require("dotenv").config();

const GetUserFollowing = async (req, res) => {
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
    const tokenUsername = await verifyToken(token);

    if (!tokenUsername) {
      return res.status(401).json("Invalid token");
    }

    const userList = await fetchUserFollowing(client, username, tokenUsername);

    res.send(userList);
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

const verifyToken = async (token) => {
  return await checkToken(token);
};

const fetchUserFollowing = async (client, requestedUsername, tokenUsername) => {
  const userListQuery = await client.query(
    `SELECT DISTINCT u.username, u.first_name, u.last_name, u.admin, u.verified, 
    f2.follow_id, fr.req_id
    FROM user_tbl u
    JOIN follow_tbl f1 ON u.username = f1.following AND f1.follower = $1
    LEFT JOIN follow_tbl f2 ON u.username = f2.following AND f2.follower = $2
    LEFT JOIN follow_request_tbl fr ON u.username = fr.req_following AND fr.req_follower = $2`,
    [requestedUsername, tokenUsername]
  );

  return userListQuery.rows.map((user) => ({
    username: user.username,
    firstName: user.first_name ?? "",
    lastName: user.last_name ?? "",
    isFollowing: user.follow_id > 0,
    isFollowRequested: user.req_id > 0,
    isVerified: user.verified ?? false,
    isAdmin: user.admin ?? false,
  }));
};

module.exports = GetUserFollowing;
