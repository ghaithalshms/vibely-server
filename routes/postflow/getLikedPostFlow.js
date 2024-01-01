const { Pool } = require("pg");
require("dotenv").config();
const checkToken = require("../../func/checkToken");

const GetLikedPostFlow = async (req, res) => {
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
      if (!res.headersSent) res.status(401);
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
      lastGotPostID > 0 ? "AND post_id < $2" : "AND post_id > $2";

    const likedPostFlowQuery = await pool.query(
      `SELECT DISTINCT post_id, posted_user, description, picture, like_count, comment_count, post_date
      FROM post_tbl, post_like_tbl 
      WHERE liked_user = $1
      AND post_id = liked_post
      AND archived = 'false'
      ${postIdInstructionString}
      ORDER BY post_id DESC
      LIMIT 5`,
      [tokenUsername, lastGotPostID]
    );

    const handleIsPostSaved = async (postID) => {
      const result = await pool.query(
        `SELECT DISTINCT saved_user FROM post_save_tbl 
      WHERE saved_user = $1 AND post_id = $2`,
        [tokenUsername, postID]
      );
      return result.rowCount > 0;
    };

    let postFlowArray = [];

    for (const post of likedPostFlowQuery.rows) {
      const isSaved = await handleIsPostSaved(post.post_id);
      postFlowArray.push({
        postID: post.post_id,
        postedUser: post.posted_user,
        description: post.description,
        picture: post.picture,
        likeCount: post.like_count,
        commentCount: post.comment_count,
        postDate: post.post_date,
        isLiked: true,
        isSaved,
      });
    }
    if (!res.headersSent)
      res.send({
        postFlowArray,
        lastGotPostID: postFlowArray[postFlowArray.length - 1]?.postID,
      });
  } catch (error) {
    if (!res.headersSent) res.status(400).json(error.message);
  }
};

module.exports = GetLikedPostFlow;
