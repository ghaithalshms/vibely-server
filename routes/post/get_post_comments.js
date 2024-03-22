require("dotenv").config();
const checkToken = require("../../func/check_token");
const pool = require("../../pg_pool");

const getPostComments = async (req, res) => {
  const { postID, token } = req.query;
  const client = await pool.connect().catch((err) => console.log(err));

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

    const postCommentsArray = await fetchPostComments(
      postID,
      tokenUsername,
      client
    );

    if (!res.headersSent) res.send(postCommentsArray);
  } catch (err) {
    console.log("unexpected error : ", err);
    res.status(500).json(err);
  } finally {
    client?.release();
  }
};

const fetchPostComments = async (postID, tokenUsername, client) => {
  const postCommentsQueryArray = await client.query(
    `SELECT DISTINCT c.comment_id, c.comment, c.like_count, c.commented_date,
    u.username, u.first_name, u.admin, u.verified,
    cl.like_id
    FROM comment_tbl c
    JOIN user_tbl u ON u.username = c.commented_user
    LEFT JOIN comment_like_tbl cl ON cl.liked_user = $2 AND cl.liked_comment = c.comment_id
    WHERE c.post = $1
    `,
    [postID, tokenUsername]
  );

  const postCommentsArray = postCommentsQueryArray.rows.map(formatCommentData);
  return postCommentsArray;
};

const formatCommentData = (comment) => ({
  commentID: comment.comment_id,
  comment: comment.comment,
  username: comment.username,
  firstName: comment.first_name,
  likeCount: comment.like_count,
  commentDate: comment.commented_date,
  isAdmin: comment.admin,
  isVerified: comment.verified,
  isLiked: comment.like_id > 0,
});

module.exports = getPostComments;
