const checkToken = require("../../func/check_token");
const pool = require("../../pg_pool");

const SavePost = async (req, res) => {
  const { token, postID } = req.body;
  const client = await pool.connect().catch((err) => console.log(err));

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

    const isSavedQuery = await client.query(
      `SELECT DISTINCT post_id from post_save_tbl WHERE saved_user=$1 AND post_id=$2`,
      [tokenUsername, postID]
    );

    // DEFINITION OF FUNCTIONS
    const handleSave = async () => {
      await client.query(
        `INSERT INTO post_save_tbl (post_id, saved_user, saved_date) values ($1,$2,$3)`,
        [postID, tokenUsername, new Date().toISOString()]
      );
      await client.query(
        `UPDATE post_tbl set save_count = save_count+1 WHERE post_id=$1`,
        [postID]
      );
      if (!res.headersSent) res.status(200).json("saved");
    };

    const handleUnsave = async () => {
      await client.query(
        `DELETE FROM post_save_tbl WHERE post_id=$1 AND saved_user=$2`,
        [postID, tokenUsername]
      );
      await client.query(
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
  } finally {
    client?.release();
  }
};

module.exports = SavePost;
