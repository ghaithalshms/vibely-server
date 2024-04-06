const { Client } = require("pg");

const checkToken = require("../../../func/check_token");

require("dotenv").config();

const GetUserFollowers = async (req, res) => {
  const { username, token } = req.query;

  if (!(username && token)) {
    return res.status(400).json("Data missing");
  }

  const client = new Client({ connectionString: process.env.DATABASE_STRING });
  await client.connect();

  try {
    const tokenUsername = await verifyToken(token);

    if (!tokenUsername) {
      return res.status(401).json("Invalid token");
    }

    const userList = await fetchUserFollowers(client, username, tokenUsername);

    res.send(userList);
  } catch (err) {
    handleError(res)(err);
  } finally {
    client?.end();
  }
};

const handleError = (res) => (err) => {
  console.error("Unexpected error:", err);
  res.status(500).json(err);
};

const verifyToken = async (token) => {
  return await checkToken(token);
};

const fetchUserFollowers = async (client, requestedUsername, tokenUsername) => {
  const userListQuery = await client.query(
    `SELECT DISTINCT u.username, u.first_name, u.last_name, u.admin, u.verified, 
    f2.follow_id, fr.req_id
    FROM user_tbl u
    JOIN follow_tbl f1 ON u.username = f1.follower AND f1.following = $1
    LEFT JOIN follow_tbl f2 ON u.username = f2.following AND f2.follower = $2
    LEFT JOIN follow_request_tbl fr ON u.username = fr.req_following AND fr.req_follower = $2
    `,
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

module.exports = GetUserFollowers;
