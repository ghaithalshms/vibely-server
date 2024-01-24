const checkToken = require("../../func/check_token");
const _pool = require("../../pg_pool");

const SavePost = async (req, res) => {
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

    const isSavedQuery = await _pool.query(
      `SELECT DISTINCT post_id from post_save_tbl WHERE saved_user=$1 AND post_id=$2`,
      [tokenUsername, postID]
    );

    // DEFINITION OF FUNCTIONS
    const handleSave = async () => {
      await _pool.query(
        `INSERT INTO post_save_tbl (post_id, saved_user, saved_date) values ($1,$2,$3)`,
        [postID, tokenUsername, new Date().toISOString()]
      );
      await _pool.query(
        `UPDATE post_tbl set save_count = save_count+1 WHERE post_id=$1`,
        [postID]
      );
      if (!res.headersSent) res.status(200).json("saved");
    };

    const handleUnsave = async () => {
      await _pool.query(
        `DELETE FROM post_save_tbl WHERE post_id=$1 AND saved_user=$2`,
        [postID, tokenUsername]
      );
      await _pool.query(
        `UPDATE post_tbl set save_count = save_count-1 WHERE post_id=$1`,
        [postID]
      );
      if (!res.headersSent) res.status(200).json("unsaved");
    };

    // START QUERY HERE

    if (isSavedQuery.rowCount > 0) {
      // DELETE SAVE
      handleUnsave();
      return;
    } else {
      handleSave();
      return;
    }
  } catch (err) {
    console.log("unexpected error : ", err);
    res.status(500).json(err);
  }
};

module.exports = SavePost;
