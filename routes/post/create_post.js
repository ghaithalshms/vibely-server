const { UploadFileFireBase } = require("../../firebase/file_process");
const checkToken = require("../../func/check_token");
const pool = require("../../pg_pool");

const CreatePost = async (req, res) => {
  const file = req.file;
  const { fileType, token, description } = req.body;

  const client = await pool.connect();

  try {
    if (!(token && (file || description))) {
      return res.status(400).json("Data missing");
    }

    const tokenUsername = await validateToken(token);
    if (!tokenUsername) {
      return res.status(401).json("Wrong token");
    }

    const filePath = file ? await uploadFile(file, fileType) : null;
    if (filePath === false) {
      return res.status(500).json("Unexpected error while uploading file");
    }

    await createPost(client, tokenUsername, description, filePath, fileType);

    return res.status(200).json("Post created");
  } catch (error) {
    console.error("Unexpected error:", error);
    return res.status(500).json(error);
  } finally {
    client.release();
  }
};

const validateToken = async (token) => {
  return await checkToken(token);
};

const uploadFile = async (file, fileType) => {
  try {
    return await UploadFileFireBase(file, fileType, "post");
  } catch (error) {
    console.error("Error uploading file:", error);
    return false;
  }
};

const createPost = async (
  client,
  username,
  description,
  filePath,
  fileType
) => {
  try {
    await client.query(
      `INSERT INTO post_tbl (posted_user, description, post_date, file_path, file_type) 
      VALUES ($1, $2, $3, $4, $5)`,
      [
        username,
        description,
        new Date().toISOString(),
        filePath || "text/plain",
        fileType,
      ]
    );

    await client.query(
      `UPDATE user_tbl SET post_count = post_count + 1 WHERE username = $1`,
      [username]
    );
  } catch (error) {
    console.error("Error creating post:", error);
    throw error;
  }
};

module.exports = CreatePost;
