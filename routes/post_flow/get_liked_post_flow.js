require("dotenv").config();
const checkToken = require("../../func/check_token");
const { Client } = require("pg");

const GetLikedPostFlow = async (req, res) => {
  const { token, lastGotPostID } = req.query;
  const client = new Client({ connectionString: process.env.DATABASE_STRING });
  await client.connect();

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
      lastGotPostID > 0 ? "AND pl.like_id < $2" : "AND pl.like_id > $2";

    const likedPostFlowQuery = await getLikedPostFlow(
      client,
      tokenUsername,
      lastGotPostID,
      postIdInstructionString
    );

    const postFlowArray = likedPostFlowQuery.rows.map((post) => ({
      post: {
        postID: post.post_id,
        orderID: post.like_id,
        description: post.description,
        fileType: post.file_type,
        likeCount: post.like_count,
        commentCount: post.comment_count,
        postDate: post.post_date,
        viewCount: post.view_count,
        isLiked: true,
        isSaved: post.saved_id > 0,
      },
      user: {
        username: post.username,
        firstName: post.first_name,
        postCount: post.post_count,
        isAdmin: post.admin,
        isVerified: post.verified,
      },
    }));

    return res.send({
      postFlowArray,
      lastGotPostID: postFlowArray[postFlowArray.length - 1]?.post.orderID,
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return res.status(500).json(error);
  } finally {
    await client?.end();
  }
};

const validateToken = async (token) => {
  return await checkToken(token);
};

const getLikedPostFlow = async (
  client,
  tokenUsername,
  lastGotPostID,
  postIdInstructionString
) => {
  return await client.query(
    `SELECT DISTINCT pl.like_id, p.post_id, p.description, p.file_type, p.like_count, 
    p.comment_count, p.post_date, p.view_count,
    u.username, u.first_name, u.post_count, u.admin, u.verified, 
    ps.saved_id
    FROM post_tbl p
    JOIN user_tbl u ON u.username = p.posted_user
    JOIN post_like_tbl pl ON pl.liked_post = p.post_id AND pl.liked_user = $1 ${postIdInstructionString}
    LEFT JOIN post_save_tbl ps ON ps.post_id = p.post_id AND ps.saved_user = $1
    AND u.username = p.posted_user
    AND p.post_id = pl.liked_post
    AND archived = 'false'
    ORDER BY pl.like_id DESC
    LIMIT 3`,
    [tokenUsername, lastGotPostID]
  );
};

module.exports = GetLikedPostFlow;
