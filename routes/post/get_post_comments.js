const { Client } = require("pg");
require("dotenv").config();
const checkToken = require("../../func/check_token");

const GetPostComments = async (req, res) => {
  const { postID, token } = req.query;
  const client = new Client({
    connectionString: process.env.DATABASE_STRING,
    connectionTimeoutMillis: 5000,
  });
  client.on("error", (err) => {
    console.log("postgres erR:", err);
  });

  try {
    if (!(postID && token)) {
      res.status(400).json("data missing");
      return;
    }

    const tokenUsername = await checkToken(token);
    if (tokenUsername === false) {
      if (!res.headersSent) res.status(401).json("wrong token");
      return;
    }
    await client.connect();

    const postCommentsQueryArray = await client.query(
      `SELECT DISTINCT comment_id, comment, like_count, commented_date,
      username, first_name, picture, admin, verified
      FROM comment_tbl, user_tbl
      WHERE post=$1 
      AND username=commented_user`,
      [postID]
    );

    const handleIsCommentLiked = async (commentID) => {
      const result = await client.query(
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
  } catch (err) {
    if (client?.connected) client.end().catch(() => {});
    console.error("unexpected error : ", err);
    res.status(500).json(err);
  } finally {
    if (client?.connected) client.end().catch(() => {});
  }
};

module.exports = GetPostComments;
