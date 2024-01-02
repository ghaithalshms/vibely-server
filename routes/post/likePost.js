const { Pool } = require("pg");
const checkToken = require("../../func/checkToken");

const LikePost = async (req, res) => {
  const { token, postID } = req.body;
  try {
    if (!(token && postID)) {
      res.status(404).json("data missing");
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

    const isLikedQuery = await pool.query(
      `SELECT DISTINCT liked_post from post_like_tbl WHERE liked_user=$1 AND liked_post=$2`,
      [tokenUsername, postID]
    );

    // DEFINITION OF FUNCTIONS
    const handleLike = async () => {
      await pool.query(
        `INSERT INTO post_like_tbl (liked_post, liked_user, liked_date) values ($1,$2,$3)`,
        [postID, tokenUsername, new Date().toISOString()]
      );
      const postedUserQuery = await pool.query(
        `UPDATE post_tbl set like_count = like_count+1 WHERE post_id=$1 RETURNING posted_user`,
        [postID]
      );
      await pool.query(
        `INSERT INTO notification_tbl (noti_from, noti_to, noti_type, noti_date) values ($1,$2,$3,$4)`,
        [
          tokenUsername,
          postedUserQuery?.rows[0].posted_user,
          "like",
          new Date().toISOString(),
        ]
      );
      if (!res.headersSent) res.status(200).json("liked");
    };

    const handleUnlike = async () => {
      await pool.query(
        `DELETE FROM post_like_tbl WHERE liked_post=$1 AND liked_user=$2`,
        [postID, tokenUsername]
      );
      const postedUserQuery = await pool.query(
        `UPDATE post_tbl set like_count = like_count-1 WHERE post_id=$1 RETURNING posted_user`,
        [postID]
      );
      await pool.query(
        `DELETE FROM notification_tbl WHERE noti_from = $1 AND noti_to = $2 AND noti_type=$3`,
        [tokenUsername, postedUserQuery?.rows[0].posted_user, "like"]
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
  }
};

module.exports = LikePost;
