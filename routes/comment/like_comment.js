const { Client } = require("pg");
const checkToken = require("../../func/check_token");

const LikeComment = async (req, res) => {
  const { token, commentID } = req.body;

  const client = new Client({
    connectionString: process.env.DATABASE_STRING,
    connectionTimeoutMillis: 5000,
  });

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
    await client.connect();

    const isLikedQuery = await client.query(
      `SELECT liked_comment from comment_like_tbl WHERE liked_user=$1 AND liked_comment=$2`,
      [tokenUsername, commentID]
    );

    // DEFINITION OF FUNCTIONS
    const handleLike = async () => {
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
      if (!res.headersSent) res.status(200).json("liked");
    };

    const handleUnlike = async () => {
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
      if (!res.headersSent) res.status(200).json("unliked");
    };

    // START QUERY HERE

    if (isLikedQuery.rowCount > 0) {
      // DELETE LIKE
      handleUnlike();
      return;
    } else {
      handleLike();
      return;
    }
  } catch (err) {
    if (!res.headersSent) res.status(500).json(err);
    if (client.connected) client.end().catch(() => {});
  } finally {
    if (client.connected) client.end().catch(() => {});
  }
};

module.exports = LikeComment;
