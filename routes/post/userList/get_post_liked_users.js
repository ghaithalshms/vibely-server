const pool = require("../../../pg_pool");

require("dotenv").config();

const GetPostLikedUsers = async (req, res) => {
  const { postID, username } = req.query;
  const client = await pool.connect().catch((err) => console.log(err));

  try {
    if (!(postID && username)) {
      res.status(400).json("data missing");
      return;
    }

    const userListQuery = await client.query(
      `SELECT DISTINCT username, first_name,last_name, admin, verified 
FROM user_tbl
JOIN post_like_tbl ON username=liked_user AND liked_post=$1
LEFT JOIN follow_tbl f2 ON u.username = f2.following AND f2.follower = $1
LEFT JOIN follow_request_tbl fr ON u.username = fr.req_following AND fr.req_follower = $1
`,
      [postID, username]
    );

    let userList = [];

    for (const user of userListQuery.rows) {
      userList.push({
        username: user.username ?? "",
        firstName: user.first_name ?? "",
        lastName: user.last_name ?? "",
        picture: null,
        isVerified: user.verified ?? false,
        isAdmin: user.admin ?? false,
      });
    }
    if (!res.headersSent) res.send(userList);
  } catch (err) {
    console.log("unexpected error : ", err);
    res.status(500).json(err);
  } finally {
    client?.release();
  }
};

module.exports = GetPostLikedUsers;
