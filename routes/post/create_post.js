const { Pool } = require("pg");
const checkToken = require("../../func/check_token");

const CreatePost = async (req, res) => {
  const file = req.file;
  const fileType = req.body.fileType;
  const buffer = file ? file.buffer : null;
  const token = req.body.token;
  const description = req.body.description;

  try {
    if (!(token && (file || description))) {
      res.status(400).json("data missing");
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
    const handlePostComment = async () => {
      await pool.query(
        `INSERT INTO post_tbl (posted_user, description, post_date, file, file_type) 
          VALUES ($1,$2,$3, $4, $5)`,
        [tokenUsername, description, new Date().toISOString(), buffer, fileType]
      );
      await pool.query(
        `UPDATE user_tbl SET post_count = post_count+1 WHERE username =$1`,
        [tokenUsername]
      );
      if (!res.headersSent) res.status(200).json("post created");
    };

    // START QUERY HERE
    handlePostComment();
  } catch (err) {
    if (!res.headersSent) res.status(500).json(err);
  }
};

module.exports = CreatePost;
