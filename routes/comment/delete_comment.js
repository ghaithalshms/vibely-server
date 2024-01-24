const checkToken = require("../../func/check_token");
const _pool = require("../../pg_pool");

const DeleteComment = async (req, res) => {
  const { token, commentID } = req.body;

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

    await _pool.query(
      `DELETE FROM comment_tbl WHERE comment_id = $1 AND commented_user = $2`,
      [commentID, tokenUsername]
    );
    if (!res.headersSent) res.status(200).json("comment deleted");
  } catch (err) {
    if (!res.headersSent) res.status(500).json(err);
  }
};

module.exports = DeleteComment;
