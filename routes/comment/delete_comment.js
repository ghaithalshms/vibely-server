const { Client } = require("pg");
const checkToken = require("../../func/check_token");

const DeleteComment = async (req, res) => {
  const { token, commentID } = req.body;
  const client = new Client({
    connectionString: process.env.DATABASE_STRING,
    connectionTimeoutMillis: 5000,
  });
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
    await client.connect();

    await client.query(
      `DELETE FROM comment_tbl WHERE comment_id = $1 AND commented_user = $2`,
      [commentID, tokenUsername]
    );
    if (!res.headersSent) res.status(200).json("comment deleted");
  } catch (err) {
    if (!res.headersSent) res.status(500).json(err);
    if (client.connected) client.end().catch(() => {});
  } finally {
    if (client.connected) client.end().catch(() => {});
  }
};

module.exports = DeleteComment;
