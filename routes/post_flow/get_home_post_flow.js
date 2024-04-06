require("dotenv").config();
const checkToken = require("../../func/check_token");
const { Pool } = require("pg");

const GetHomePostFlow = async (req, res) => {
  const { token, lastGotPostID } = req.query;

  const pool = new Pool({ connectionString: process.env.DATABASE_STRING });
  const client = await pool.connect();

  try {
    if (!lastGotPostID) {
      return res.json({ postFlowArray: [] });
    }

    if (!token) {
      return res.status(401).json("Data missing");
    }

    const tokenUsername = await validateToken(token);

    if (!tokenUsername) {
      return res.status(401).json("Wrong token");
    }

    const postIdInstructionString =
      lastGotPostID > 0 ? "AND p.post_id < $2" : "AND p.post_id > $2";

    const homePostFlowQuery = await getHomePostFlow(
      client,
      tokenUsername,
      lastGotPostID,
      postIdInstructionString
    );

    const postFlowArray = formatPostFlowArray(homePostFlowQuery.rows);

    return res.send({
      postFlowArray,
      lastGotPostID: postFlowArray[postFlowArray.length - 1]?.post?.postID,
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return res.status(500).json("Internal server error");
  } finally {
    await client?.release();
  }
};

const validateToken = async (token) => {
  return await checkToken(token);
};

const getHomePostFlow = async (
  client,
  tokenUsername,
  lastGotPostID,
  postIdInstructionString
) => {
  return await client.query(
    `SELECT DISTINCT p.post_id, p.description, p.file_type, p.like_count, p.comment_count, p.post_date, p.view_count,
    u.username, u.first_name, u.admin, u.verified,
    pl.like_id, ps.saved_id
    FROM post_tbl p
    JOIN user_tbl u ON u.username = p.posted_user
    JOIN follow_tbl f ON f.following=p.posted_user AND f.follower=$1
    LEFT JOIN post_like_tbl pl ON pl.liked_post = p.post_id AND pl.liked_user =$1
    LEFT JOIN post_save_tbl ps ON ps.post_id = p.post_id AND ps.saved_user = $1
    WHERE archived=false
    ${postIdInstructionString}
    ORDER BY p.post_id desc
    LIMIT 3`,
    [tokenUsername, lastGotPostID]
  );
};

const formatPostFlowArray = (rows) => {
  return rows.map((post) => ({
    post: {
      postID: post.post_id,
      description: post.description,
      fileType: post.file_type,
      likeCount: post.like_count,
      commentCount: post.comment_count,
      postDate: post.post_date,
      isLiked: post.like_id > 0,
      isSaved: post.saved_id > 0,
      viewCount: post.view_count,
    },
    user: {
      username: post.username,
      firstName: post.first_name,
      isAdmin: post.admin,
      isVerified: post.verified,
    },
  }));
};

module.exports = GetHomePostFlow;
