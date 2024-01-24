const checkToken = require("../../func/check_token");
const _pool = require("../../pg_pool");

const DeletePost = async (req, res) => {
  const { token, postID } = req.body;

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
    await _pool
      .connect()
      .then()
      .catch(() => {
        if (!res.headersSent) res.status(502).json("DB connection error");
        return;
      });

    const deleteQuery = await _pool.query(
      `DELETE FROM post_tbl 
      WHERE post_id = $1 AND posted_user = $2
      RETURNING post_id`,
      [postID, tokenUsername]
    );
    if (deleteQuery.rowCount > 0)
      await _pool.query(
        `UPDATE user_tbl 
      SET post_count=post_count-1 
      WHERE username = $1`,
        [tokenUsername]
      );
    if (!res.headersSent) res.status(200).json("post deleted");
  } catch (err) {
    console.log("unexpected error : ", err);
    res.status(500).json(err);
  }
};

module.exports = DeletePost;
