const checkToken = require("../../func/check_token");
const { Pool } = require("pg");

const handleLikePost = async (req, res) => {
  const { token, postID } = req.body;
  const pool = new Pool({ connectionString: process.env.DATABASE_STRING });
  const client = await pool.connect().catch((err) => {
    console.log(err);
    res.status(500).json(err);
  });
  client.on("error", (err) =>
    console.error("something bad has happened!", err.stack)
  );

  try {
    if (!(token && postID)) {
      res.status(400).json("data missing");
      return;
    }

    const tokenUsername = await checkToken(token);
    if (tokenUsername === false) {
      if (!res.headersSent) res.status(401).json("wrong token");
      return;
    }

    const postLiked = await isPostLiked(tokenUsername, postID, client);

    if (postLiked) {
      await handleUnlike(postID, tokenUsername, client);
      if (!res.headersSent) res.status(200).json("unliked");
    } else {
      await handleLike(postID, tokenUsername, client);
      if (!res.headersSent) res.status(200).json("liked");
    }
  } catch (err) {
    console.log("unexpected error : ", err);
    res.status(500).json(err);
  } finally {
    await client?.release();
  }
};

const isPostLiked = async (tokenUsername, postID, client) => {
  const isLikedQuery = await client.query(
    `SELECT DISTINCT liked_post from post_like_tbl WHERE liked_user=$1 AND liked_post=$2`,
    [tokenUsername, postID]
  );
  return isLikedQuery.rowCount > 0;
};

const handleLike = async (postID, tokenUsername, client) => {
  await client.query(
    `INSERT INTO post_like_tbl (liked_post, liked_user, liked_date) values ($1,$2,$3)`,
    [postID, tokenUsername, new Date().toISOString()]
  );

  const postedUserQuery = await client.query(
    `UPDATE post_tbl set like_count = like_count+1 WHERE post_id=$1 RETURNING posted_user`,
    [postID]
  );

  await client.query(
    `INSERT INTO notification_tbl (noti_from, noti_to, noti_type, noti_date) values ($1,$2,$3,$4)`,
    [
      tokenUsername,
      postedUserQuery?.rows[0].posted_user,
      "like",
      new Date().toISOString(),
    ]
  );
};

const handleUnlike = async (postID, tokenUsername, client) => {
  await client.query(
    `DELETE FROM post_like_tbl WHERE liked_post=$1 AND liked_user=$2`,
    [postID, tokenUsername]
  );

  const postedUserQuery = await client.query(
    `UPDATE post_tbl set like_count = like_count-1 WHERE post_id=$1 RETURNING posted_user`,
    [postID]
  );

  await client.query(
    `DELETE FROM notification_tbl WHERE noti_from = $1 AND noti_to = $2 AND noti_type=$3`,
    [tokenUsername, postedUserQuery?.rows[0].posted_user, "like"]
  );
};

module.exports = handleLikePost;
