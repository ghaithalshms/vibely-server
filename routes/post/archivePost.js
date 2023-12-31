const { Pool } = require("pg");
const checkToken = require("../../func/checkToken");

const ArchivePost = async (req, res) => {
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
      if (!res.headersSent) res.status(401);
      return;
    }
    await pool
      .connect()
      .then()
      .catch(() => {
        if (!res.headersSent) res.status(502).json("DB connection error");
        return;
      });

    const archiveQuery = await pool.query(
      `UPDATE post_tbl 
      SET archived=true 
      WHERE post_id = $1 AND posted_user = $2
      RETURNING post_id`,
      [postID, tokenUsername]
    );

    if (archiveQuery.rowCount > 0)
      await pool.query(
        `UPDATE user_tbl 
      SET post_count=post_count-1 
      WHERE username = $1`,
        [tokenUsername]
      );
    if (!res.headersSent) res.status(200).json("post archived");
  } catch (err) {
    if (!res.headersSent) res.status(500).json(err);
  }
};

module.exports = ArchivePost;
