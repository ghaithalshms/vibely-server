const checkToken = require("../../func/check_token");
const pool = require("../../pg_pool");

const CreateComment = async (req, res) => {
  const { token, postID, comment } = req.body;
  const client = await pool.connect().catch((err) => console.log(err));
  client.on("error", (err) => console.log(err));
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

    // DEFINITION OF FUNCTIONS
    const handleCreateComment = async () => {
      await client.query(
        `INSERT INTO comment_tbl (comment, post, commented_user, commented_date) values ($1,$2,$3,$4)`,
        [comment, postID, tokenUsername, new Date().toISOString()]
      );
      const postedUserQuery = await client.query(
        `UPDATE post_tbl set comment_count=comment_count+1 WHERE post_id = $1 RETURNING posted_user`,
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
  } finally {
    client?.release();
  }
};

module.exports = CreateComment;
