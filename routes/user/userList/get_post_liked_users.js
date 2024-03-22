const checkToken = require("../../../func/check_token");
const pool = require("../../../pg_pool");
require("dotenv").config();

const GetPostLikedUsers = async (req, res) => {
  const { postID, token } = req.query;
  const client = await pool.connect().catch((err) => {
    console.log(err);
    throw err;
  });

  try {
    if (!(postID && token)) {
      return res.status(400).json("Data missing");
    }

    const tokenUsername = await validateToken(token);
    if (!tokenUsername) {
      return res.json("Wrong token").status(401);
    }

    const userList = await getPostLikedUserList(client, postID, tokenUsername);
    return res.send(userList);
  } catch (error) {
    console.error("Unexpected error:", error);
    return res.status(500).json(error);
  } finally {
    client.release();
  }
};

const validateToken = async (token) => {
  return await checkToken(token);
};

const getPostLikedUserList = async (client, postID, tokenUsername) => {
  const userListQuery = await client.query(
    `SELECT DISTINCT u.username, u.first_name,u.last_name, u.admin, u.verified,
    f2.follow_id, fr.req_id
    FROM user_tbl u
    JOIN post_like_tbl pl ON username=pl.liked_user AND pl.liked_post=$1
    LEFT JOIN follow_tbl f2 ON u.username = f2.following AND f2.follower = $2
    LEFT JOIN follow_request_tbl fr ON u.username = fr.req_following AND fr.req_follower = $2`,
    [postID, tokenUsername]
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

module.exports = GetPostLikedUsers;
