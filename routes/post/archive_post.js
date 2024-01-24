const checkToken = require("../../func/check_token");
const _pool = require("../../pg_pool");

const ArchivePost = async (req, res) => {
  const { token, postID } = req.body;
  const client = new Client({
    connectionString: process.env.DATABASE_STRING,
    connectionTimeoutMillis: 5000,
  });
  client.on("error", (err) => {
    console.log("postgres erR:", err);
  });

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

    const archiveQuery = await _pool.query(
      `UPDATE post_tbl 
      SET archived=true 
      WHERE post_id = $1 AND posted_user = $2
      RETURNING post_id`,
      [postID, tokenUsername]
    );

    if (archiveQuery.rowCount > 0)
      await _pool.query(
        `UPDATE user_tbl 
      SET post_count=post_count-1 
      WHERE username = $1`,
        [tokenUsername]
      );
    if (!res.headersSent) res.status(200).json("post archived");
  } catch (err) {
    console.log("unexpected error : ", err);
    res.status(500).json(err);
  }
};

module.exports = ArchivePost;
