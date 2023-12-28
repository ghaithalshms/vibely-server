const { Pool } = require("pg");
require("dotenv").config();
const checkToken = require("../../func/checkToken");

const GetUserPostFlow = async (req, res) => {
  const pool = new Pool({
    connectionString: process.env.DATABASE_STRING,
    connectionTimeoutMillis: 5000,
  });
  const { username, token, lastGotPostID } = req.query;
  try {
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

    const userPostFlowQuery = await pool.query(
      `SELECT post_id, description, picture, like_count, comment_count, post_date
      FROM post_tbl 
      WHERE posted_user = $1
      AND archived = 'false'
      AND post_id > $2
      ORDER BY post_id DESC
      LIMIT 3`,
      [username, lastGotPostID]
    );

    const handleIsPostLiked = async (postID) => {
      const result = await pool.query(
        `SELECT liked_user FROM post_like_tbl 
      WHERE liked_user = $1 AND liked_post = $2`,
        [username, postID]
      );
      return result.rowCount > 0;
    };

    const handleIsPostSaved = async (postID) => {
      const result = await pool.query(
        `SELECT saved_user FROM post_save_tbl 
      WHERE saved_user = $1 AND post_id = $2`,
        [username, postID]
      );
      return result.rowCount > 0;
    };

    let postFlowArray = [];

    for (const post of userPostFlowQuery.rows) {
      const isLiked = await handleIsPostLiked(post.post_id);
      const isSaved = await handleIsPostSaved(post.post_id);
      postFlowArray.push({
        postID: post.post_id,
        description: post.description,
        picture: post.picture,
        likeCount: post.like_count,
        commentCount: post.comment_count,
        postDate: post.post_date,
        isLiked,
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

module.exports = GetUserPostFlow;
