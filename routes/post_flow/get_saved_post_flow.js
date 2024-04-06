require("dotenv").config();
const checkToken = require("../../func/check_token");
const { Client } = require("pg");

const GetSavedPostFlow = async (req, res) => {
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
      lastGotPostID > 0 ? "AND ps.saved_id < $2" : "AND ps.saved_id > $2";

    console.log(postIdInstructionString, lastGotPostID);

    const savedPostFlowQuery = await getSavedPostFlow(
      client,
      tokenUsername,
      lastGotPostID,
      postIdInstructionString
    );

    const postFlowArray = savedPostFlowQuery.rows.map((post) => ({
      post: {
        postID: post.post_id,
        orderID: post.saved_id,
        description: post.description,
        fileType: post.file_type,
        likeCount: post.like_count,
        commentCount: post.comment_count,
        postDate: post.post_date,
        viewCount: post.view_count,
        isLiked: post.like_id > 0,
        isSaved: true,
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
    client?.end();
  }
};

const validateToken = async (token) => {
  return await checkToken(token);
};

const getSavedPostFlow = async (
  client,
  tokenUsername,
  lastGotPostID,
  postIdInstructionString
) => {
  return await client.query(
    `SELECT DISTINCT ps.saved_id, p.post_id, p.description, p.file_type, p.like_count, 
    p.comment_count, p.post_date, p.view_count,
    u.username, u.first_name, u.post_count, u.admin, u.verified, 
    pl.like_id
    FROM post_tbl p
    JOIN user_tbl u ON u.username = p.posted_user
    JOIN post_save_tbl ps ON ps.post_id = p.post_id AND ps.saved_user = $1 ${postIdInstructionString}
    LEFT JOIN post_like_tbl pl ON pl.liked_post = p.post_id AND pl.liked_user = $1
    AND u.username = p.posted_user
    AND p.post_id = ps.post_id
    AND archived = 'false'
    ORDER BY ps.saved_id DESC
    LIMIT 3`,
    [tokenUsername, lastGotPostID]
  );
};

module.exports = GetSavedPostFlow;
