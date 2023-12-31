const { Client } = require("pg");
const checkToken = require("../../func/check_token");

const ArchivePost = async (req, res) => {
  const { token, postID } = req.body;
  const client = new Client({
    connectionString: process.env.DATABASE_STRING,
    connectionTimeoutMillis: 5000,
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
    await client
      .connect()
      .then()
      .catch(() => {
        if (!res.headersSent) res.status(502).json("DB connection error");
        return;
      });

    const archiveQuery = await client.query(
      `UPDATE post_tbl 
      SET archived=true 
      WHERE post_id = $1 AND posted_user = $2
      RETURNING post_id`,
      [postID, tokenUsername]
    );

    if (archiveQuery.rowCount > 0)
      await client.query(
        `UPDATE user_tbl 
      SET post_count=post_count-1 
      WHERE username = $1`,
        [tokenUsername]
      );
    if (!res.headersSent) res.status(200).json("post archived");
  } catch (err) {
    if (client.connected) client.end().catch(() => {});
    console.error("unexpected error : ", err);
    res.status(500).json(err);
  } finally {
    if (client.connected) client.end().catch(() => {});
  }
};

module.exports = ArchivePost;
