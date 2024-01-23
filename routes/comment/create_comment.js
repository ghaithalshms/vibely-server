const { Client } = require("pg");
const checkToken = require("../../func/check_token");

const CreateComment = async (req, res) => {
  const { token, postID, comment } = req.body;

  const client = new Client({
    connectionString: process.env.DATABASE_STRING,
    connectionTimeoutMillis: 30000,
  });
  client.on("error", (err) => {
    console.log("postgres erR:", err);
  });

  try {
    if (!(token && postID && comment)) {
      res.status(400).json("data missing");
      return;
    }

    const tokenUsername = await checkToken(token);
    if (tokenUsername === false) {
      if (!res.headersSent) res.status(401).json("wrong token");
      return;
    }
    await client.connect();

    // DEFINITION OF FUNCTIONS
    const handleCreateComment = async () => {
      await client.query(
        `INSERT INTO comment_tbl (comment, post, commented_user, commented_date) values ($1,$2,$3,$4)`,
        [comment, postID, tokenUsername, new Date().toISOString()]
      );
      const postedUserQuery = await client.query(
        `SELECT posted_user FROM post_tbl WHERE post_id = $1`,
        [postID]
      );
      await client.query(
        `INSERT INTO notification_tbl (noti_from, noti_to, noti_type, noti_date) values ($1,$2,$3,$4)`,
        [
          tokenUsername,
          postedUserQuery?.rows[0].posted_user,
          "comment",
          new Date().toISOString(),
        ]
      );
      if (!res.headersSent) res.status(200).json("comment created");
    };

    // START QUERY HERE
    handleCreateComment();
  } catch (err) {
    if (!res.headersSent) res.status(500).json(err);
    if (client?.connected) client.end().catch(() => {});
  } finally {
    if (client?.connected) client.end().catch(() => {});
  }
};

module.exports = CreateComment;
