require("dotenv").config();
const checkToken = require("../../func/check_token");
const { Pool } = require("pg");

const GetArchivedPostFlow = async (req, res) => {
  const { token, lastGotPostID } = req.query;
  const pool = new Pool({ connectionString: process.env.DATABASE_STRING });
  const client = await pool.connect().catch((err) => {
    console.log(err);
    res.status(500).json(err);
  });
  client.on("error", (err) =>
    console.error("something bad has happened!", err.stack)
  );

  try {
    if (!lastGotPostID) {
      return res.json({ postFlowArray: [] });
    }
    if (!token) {
      return res.status(401).json("Data missing");
    }

    const tokenUsername = await verifyToken(token);
    if (!tokenUsername) {
      return res.status(401).json("Wrong token");
    }

    const postIdInstructionString =
      lastGotPostID > 0 ? "AND p.post_id < $2" : "AND p.post_id > $2";

    const postFlowArray = await getArchivedPostFlow(
      client,
      tokenUsername,
      lastGotPostID,
      postIdInstructionString
    );

    return res.send({
      postFlowArray,
      lastGotPostID:
        postFlowArray.length > 0
          ? postFlowArray[postFlowArray.length - 1]?.post.postID
          : null,
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return res.status(500).json(error);
  } finally {
    await client?.release();
  }
};

const verifyToken = async (token) => {
  return await checkToken(token);
};

const getArchivedPostFlow = async (
  client,
  tokenUsername,
  lastGotPostID,
  postIdInstructionString
) => {
  const likedPostFlowQuery = await client.query(
    `SELECT DISTINCT p.post_id, p.description, p.file_type, p.like_count, p.comment_count, p.post_date, p.view_count,
    u.username, u.first_name, u.post_count, u.admin, u.verified,
    pl.like_id, ps.saved_id
    FROM post_tbl p
    JOIN user_tbl u ON u.username = p.posted_user
    LEFT JOIN post_like_tbl pl ON pl.liked_post = p.post_id AND pl.liked_user = $1
    LEFT JOIN post_save_tbl ps ON ps.post_id = p.post_id AND ps.saved_user = $1
    WHERE posted_user = $1
    AND username = posted_user
    AND archived = 'true'
    ${postIdInstructionString}
    ORDER BY p.post_id DESC
    LIMIT 3`,
    [tokenUsername, lastGotPostID]
  );

  const postFlowArray = likedPostFlowQuery.rows.map((post) => ({
    post: {
      postID: post.post_id,
      description: post.description,
      fileType: post.file_type,
      likeCount: post.like_count,
      commentCount: post.comment_count,
      postDate: post.post_date,
      viewCount: post.view_count,
      isLiked: post.like_id > 0,
      isSaved: post.saved_id > 0,
      isArchived: true,
    },
    user: {
      username: post.username,
      firstName: post.first_name,
      postCount: post.post_count,
      isAdmin: post.admin,
      isVerified: post.verified,
    },
  }));

  return postFlowArray;
};

module.exports = GetArchivedPostFlow;
