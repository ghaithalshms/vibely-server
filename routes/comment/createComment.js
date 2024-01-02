const { Pool } = require("pg");
const checkToken = require("../../func/checkToken");

const CreateComment = async (req, res) => {
  const { token, postID, comment } = req.body;
  try {
    if (!(token && postID && comment)) {
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

    // DEFINITION OF FUNCTIONS
    const handleCreateComment = async () => {
      await pool.query(
        `INSERT INTO comment_tbl (comment, post, commented_user, commented_date) values ($1,$2,$3,$4)`,
        [comment, postID, tokenUsername, new Date().toISOString()]
      );
      const postedUserQuery = await pool.query(
        `SELECT posted_user FROM post_tbl WHERE post_id = $1`,
        [postID]
      );
      await pool.query(
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
  }
};

module.exports = CreateComment;
