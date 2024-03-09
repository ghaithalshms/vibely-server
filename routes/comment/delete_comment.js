const checkToken = require("../../func/check_token");
const pool = require("../../pg_pool");

const DeleteComment = async (req, res) => {
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

    await client.query(
      `DELETE FROM comment_tbl WHERE comment_id = $1 AND commented_user = $2`,
      [commentID, tokenUsername]
    );
    await client.query(
      `UPDATE post_tbl set comment_count=comment_count-1 WHERE post_id = $1`,
      [postID]
    );

    if (!res.headersSent) res.status(200).json("comment deleted");
  } catch (err) {
    if (!res.headersSent) res.status(500).json(err);
  } finally {
    client?.release();
  }
};

module.exports = DeleteComment;
