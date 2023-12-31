const { Pool } = require("pg");
require("dotenv").config();
const checkToken = require("../../func/checkToken");

const GetPostComments = async (req, res) => {
  const { postID, token } = req.query;
  try {
    if (!(postID, token)) {
      res.status(404).json("data missing");
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

    const postCommentsQueryArray = await pool.query(
      `SELECT DISTINCT comment_id, comment, like_count, commented_date,
      username, first_name, picture, admin, verified
      FROM comment_tbl, user_tbl
      WHERE post=$1 
      AND username=commented_user`,
      [postID]
    );

    const handleIsCommentLiked = async (commentID) => {
      const result = await pool.query(
        `SELECT DISTINCT liked_user FROM comment_like_tbl 
      WHERE liked_user = $1 AND liked_comment = $2`,
        [tokenUsername, commentID]
      );
      return result.rowCount > 0;
    };

    let postCommentsArray = [];

    for (const comment of postCommentsQueryArray.rows) {
      const isLiked = await handleIsCommentLiked(comment.comment_id);
      postCommentsArray.push({
        commentID: comment.comment_id,
        comment: comment.comment,
        username: comment.username,
        firstName: comment.first_name,
        picture: comment.picture,
        likeCount: comment.like_count,
        commentDate: comment.commented_date,
        isAdmin: comment.admin,
        isVerified: comment.verified,
        isLiked,
      });
    }
    if (!res.headersSent) res.send(postCommentsArray);
  } catch (error) {
    if (!res.headersSent) res.status(400).json(error.message);
  }
};

module.exports = GetPostComments;
