const checkToken = require("../../func/check_token");
const { Pool } = require("pg");

const Follow = async (req, res) => {
  const { token, username } = req.body;

  if (!(token && username)) {
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
    const tokenUsername = await checkToken(token);

    if (!tokenUsername) {
      return res.status(401).json("Invalid token");
    }

    const followingResult = await queryFollowTable(
      client,
      tokenUsername,
      username
    );
    const followRequestResult = await queryFollowRequestTable(
      client,
      tokenUsername,
      username
    );
    const privacityQuery = await queryPrivacity(client, username);

    if (followingResult.rowCount > 0) {
      handleUnfollow(res, client, tokenUsername, username);
    } else if (followRequestResult.rows.length > 0) {
      handleDeleteFollowRequest(res, client, tokenUsername, username);
    } else if (
      privacityQuery.rowCount > 0 &&
      privacityQuery.rows[0].privacity === true
    ) {
      handleFollowRequest(res, client, tokenUsername, username);
    } else {
      handleFollow(res, client, tokenUsername, username);
    }
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

const queryFollowTable = async (client, follower, following) => {
  return await client.query(
    `SELECT * from follow_tbl WHERE follower=$1 AND following=$2`,
    [follower, following]
  );
};

const queryFollowRequestTable = async (client, follower, following) => {
  return await client.query(
    `SELECT * from follow_request_tbl WHERE req_follower=$1 AND req_following=$2`,
    [follower, following]
  );
};

const queryPrivacity = async (client, username) => {
  return await client.query(
    `SELECT privacity FROM user_tbl WHERE username=$1`,
    [username]
  );
};

const handleFollow = async (res, client, follower, following) => {
  await client.query(
    `INSERT INTO follow_tbl (follower, following, following_date) values ($1,$2,$3)`,
    [follower, following, new Date().toISOString()]
  );
  await client.query(
    `UPDATE user_tbl set following_count = following_count+1 WHERE username=$1`,
    [follower]
  );
  await client.query(
    `UPDATE user_tbl set follower_count = follower_count+1 WHERE username=$1`,
    [following]
  );
  await client.query(
    `INSERT INTO notification_tbl (noti_from, noti_to, noti_type, noti_date) values ($1,$2,$3,$4)`,
    [follower, following, "follow", new Date().toISOString()]
  );
  if (!res.headersSent) res.status(200).json("Followed");
};

const handleFollowRequest = async (res, client, follower, following) => {
  await client.query(
    `INSERT INTO follow_request_tbl (req_follower, req_following, req_date) values ($1,$2,$3)`,
    [follower, following, new Date().toISOString()]
  );
  await client.query(
    `UPDATE user_tbl set request_count = request_count+1 WHERE username=$1`,
    [following]
  );
  await client.query(
    `INSERT INTO notification_tbl (noti_from, noti_to, noti_type, noti_date) values ($1,$2,$3,$4)`,
    [follower, following, "request", new Date().toISOString()]
  );
  if (!res.headersSent) res.status(200).json("Follow request sent");
};

const handleUnfollow = async (res, client, follower, following) => {
  await client.query(
    `DELETE FROM follow_tbl WHERE follower=$1 AND following=$2`,
    [follower, following]
  );
  await client.query(
    `UPDATE user_tbl set following_count = following_count-1 WHERE username=$1`,
    [follower]
  );
  await client.query(
    `UPDATE user_tbl set follower_count = follower_count-1 WHERE username=$1`,
    [following]
  );
  await client.query(
    `DELETE FROM notification_tbl WHERE noti_from = $1 AND noti_to = $2 AND noti_type=$3`,
    [follower, following, "follow"]
  );
  if (!res.headersSent) res.status(200).json("Unfollowed");
};

const handleDeleteFollowRequest = async (res, client, follower, following) => {
  await client.query(
    `DELETE FROM follow_request_tbl WHERE req_follower=$1 AND req_following=$2`,
    [follower, following]
  );
  await client.query(
    `UPDATE user_tbl set request_count = request_count-1 WHERE username=$1`,
    [following]
  );
  await client.query(
    `DELETE FROM notification_tbl WHERE noti_from = $1 AND noti_to = $2 AND noti_type=$3`,
    [follower, following, "request"]
  );
  if (!res.headersSent) res.status(200).json("Follow request deleted");
};

module.exports = Follow;
