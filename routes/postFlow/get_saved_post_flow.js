const { Pool } = require("pg");
require("dotenv").config();
const checkToken = require("../../func/check_token");

const GetSavedPostFlow = async (req, res) => {
  const { token, lastGotPostID } = req.query;
  try {
    if (!lastGotPostID) {
      res.json("no post flow");
      return;
    }
    if (!token) {
      res.status(401).json("data missing");
      return;
    }
    const pool = new Pool({
      connectionString: process.env.DATABASE_STRING,
      connectionTimeoutMillis: 5000,
    });
    const tokenUsername = await checkToken(token);
    if (tokenUsername === false) {
      if (!res.headersSent) res.status(401).json("wrong token");
      return;
    }
    await pool
      .connect()
      .then()
      .catch(() => {
        if (!res.headersSent) res.status(502).json("DB connection error");
        return;
      });

    const postIdInstructionString =
      lastGotPostID > 0 ? "AND saved_id < $2" : "AND saved_id > $2";

    const likedPostFlowQuery = await pool.query(
      `SELECT DISTINCT saved_id, post_tbl.post_id, description, file, file_type, like_count, comment_count, post_date,
      username, first_name, post_count, user_tbl.picture as user_picture, admin, verified
      FROM post_tbl, post_save_tbl, user_tbl 
      WHERE saved_user = $1
      AND username=posted_user
      AND post_tbl.post_id = post_save_tbl.post_id
      AND archived = 'false'
      ${postIdInstructionString}
      ORDER BY saved_id DESC
      LIMIT 5`,
      [tokenUsername, lastGotPostID]
    );

    const handleIsPostLiked = async (postID) => {
      const result = await pool.query(
        `SELECT DISTINCT liked_user FROM post_like_tbl
      WHERE liked_user = $1 AND liked_post = $2`,
        [tokenUsername, postID]
      );
      return result.rowCount > 0;
    };

    let postFlowArray = [];

    for (const post of likedPostFlowQuery.rows) {
      const isLiked = await handleIsPostLiked(post.post_id);
      postFlowArray.push({
        post: {
          postID: post.post_id,
          orderID: post.saved_id,
          description: post.description,
          file: post.file,
          fileType: post.file_type,
          likeCount: post.like_count,
          commentCount: post.comment_count,
          postDate: post.post_date,
          isLiked,
          isSaved: true,
        },
        user: {
          username: post.username,
          firstName: post.first_name,
          picture: post.user_picture,
          postCount: post.post_count,
          isAdmin: post.admin,
          isVerified: post.verified,
        },
      });
    }
    if (!res.headersSent)
      res.send({
        postFlowArray,
        lastGotPostID: postFlowArray[postFlowArray.length - 1]?.post.orderID,
      });
  } catch (error) {
    if (!res.headersSent) res.status(400).json(error.message);
  }
};

module.exports = GetSavedPostFlow;