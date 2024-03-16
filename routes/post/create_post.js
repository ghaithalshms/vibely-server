const { UploadFileFireBase } = require("../../firebase/file_process");
const checkToken = require("../../func/check_token");
const pool = require("../../pg_pool");

const CreatePost = async (req, res) => {
  const file = req.file;
  const { fileType, token, description } = req.body;

  const client = await pool.connect().catch((err) => console.log(err));
  try {
    if (!(token && (file || description))) {
      res.status(400).json("data missing");
      return;
    }

    const tokenUsername = await checkToken(token);
    if (tokenUsername === false) {
      if (!res.headersSent) res.status(401).json("wrong token");
      return;
    }

    const filePath = file
      ? await UploadFileFireBase(file, fileType, "post")
      : null;
    if (filePath === false) {
      if (!res.headersSent)
        res.status(500).json("unexpected error while uploading file");
      return;
    }

    // DEFINITION OF FUNCTIONS
    const handlePost = async () => {
      await client.query(
        `INSERT INTO post_tbl (posted_user, description, post_date, file_path, file_type) 
          VALUES ($1,$2,$3, $4, $5)`,
        [
          tokenUsername,
          description,
          new Date().toISOString(),
          filePath || "text/plain",
          fileType,
        ]
      );
      await client.query(
        `UPDATE user_tbl SET post_count = post_count+1 WHERE username =$1`,
        [tokenUsername]
      );
      if (!res.headersSent) res.status(200).json("post created");
    };

    // START QUERY HERE
    handlePost();
  } catch (err) {
    console.log("unexpected error : ", err);
    res.status(500).json(err);
  } finally {
    client?.release();
  }
};

module.exports = CreatePost;
