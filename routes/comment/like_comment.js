const checkToken = require("../../func/check_token");
const pool = require("../../pg_pool");

const likeComment = async (req, res) => {
  const { token, commentID } = req.body;
  const client = await pool.connect().catch((err) => console.log(err));

  try {
    if (!(token && commentID)) {
      res.status(400).json("data missing");
      return;
    }

    const tokenUsername = await checkToken(token);
    if (tokenUsername === false) {
      if (!res.headersSent) res.status(401).json("wrong token");
      return;
    }

    const isLiked = await isCommentLiked(tokenUsername, commentID, client);
    if (isLiked) {
      await handleUnlikeComment(commentID, tokenUsername, client);
      if (!res.headersSent) res.status(200).json("unliked");
    } else {
      await handleLikeComment(commentID, tokenUsername, client);
      if (!res.headersSent) res.status(200).json("liked");
    }
  } catch (err) {
    if (!res.headersSent) res.status(500).json(err);
  } finally {
    client?.release();
  }
};

const isCommentLiked = async (tokenUsername, commentID, client) => {
  const isLikedQuery = await client.query(
    `SELECT liked_comment from comment_like_tbl WHERE liked_user=$1 AND liked_comment=$2`,
    [tokenUsername, commentID]
  );
  return isLikedQuery.rowCount > 0;
};

const handleLikeComment = async (commentID, tokenUsername, client) => {
  await client.query(
    `INSERT INTO comment_like_tbl (liked_comment, liked_user, liked_date) values ($1,$2,$3)`,
    [commentID, tokenUsername, new Date().toISOString()]
  );
  const commentedUserQuery = await client.query(
    `UPDATE comment_tbl set like_count = like_count+1 WHERE comment_id=$1 RETURNING commented_user`,
    [commentID]
  );
  await client.query(
    `INSERT INTO notification_tbl (noti_from, noti_to, noti_type, noti_date) values ($1,$2,$3,$4)`,
    [
      tokenUsername,
      commentedUserQuery?.rows[0].commented_user,
      "comment like",
      new Date().toISOString(),
    ]
  );
};

const handleUnlikeComment = async (commentID, tokenUsername, client) => {
  await client.query(
    `DELETE FROM comment_like_tbl WHERE liked_comment=$1 AND liked_user=$2`,
    [commentID, tokenUsername]
  );
  const commentedUserQuery = await client.query(
    `UPDATE comment_tbl set like_count = like_count-1 WHERE comment_id=$1 RETURNING commented_user`,
    [commentID]
  );
  await client.query(
    `DELETE FROM notification_tbl WHERE noti_from = $1 AND noti_to = $2 AND noti_type=$3`,
    [tokenUsername, commentedUserQuery?.rows[0].posted_user, "comment like"]
  );
};

module.exports = likeComment;
