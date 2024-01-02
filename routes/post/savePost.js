const { Pool } = require("pg");
const checkToken = require("../../func/checkToken");

const SavePost = async (req, res) => {
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

    const isSavedQuery = await pool.query(
      `SELECT DISTINCT post_id from post_save_tbl WHERE saved_user=$1 AND post_id=$2`,
      [tokenUsername, postID]
    );

    // DEFINITION OF FUNCTIONS
    const handleSave = async () => {
      await pool.query(
        `INSERT INTO post_save_tbl (post_id, saved_user, saved_date) values ($1,$2,$3)`,
        [postID, tokenUsername, new Date().toISOString()]
      );
      await pool.query(
        `UPDATE post_tbl set save_count = save_count+1 WHERE post_id=$1`,
        [postID]
      );
      if (!res.headersSent) res.status(200).json("saved");
    };

    const handleUnsave = async () => {
      await pool.query(
        `DELETE FROM post_save_tbl WHERE post_id=$1 AND saved_user=$2`,
        [postID, tokenUsername]
      );
      await pool.query(
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
    if (!res.headersSent) res.status(500).json(err);
  }
};

module.exports = SavePost;
