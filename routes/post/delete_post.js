const { DeleteFileFromFirebase } = require("../../firebase/delete_file");
const checkToken = require("../../func/check_token");
const { Pool } = require("pg");

const DeletePost = async (req, res) => {
  try {
    const { token, postID } = req.body;

    if (!token || !postID) {
      return res.status(400).json("Data missing");
    }

    const tokenUsername = await checkToken(token);

    if (!tokenUsername) {
      return res.status(401).json("Wrong token");
    }

    const filePath = await getFilePath(postID, tokenUsername);

    if (filePath && !filePath.startsWith("text")) {
      const isDeletedFromFirebase = await DeleteFileFromFirebase(filePath);

      if (!isDeletedFromFirebase) {
        return res.status(404).json("Post not found or unauthorized");
      }
    }

    const deleteResult = await deletePost(postID, tokenUsername);

    if (deleteResult) {
      await decrementPostCount(tokenUsername);
      return res.status(200).json("Post deleted");
    } else {
      return res.status(404).json("Post not found or unauthorized");
    }
  } catch (error) {
    console.error("Unexpected error:", error);
    return res.status(500).json("Internal server error");
  }
};

const getFilePath = async (postID, tokenUsername) => {
  const result = await pool.query(
    `SELECT file_path FROM post_tbl WHERE post_id = $1 AND posted_user = $2`,
    [postID, tokenUsername]
  );
  return result.rows[0]?.file_path;
};

const deletePost = async (postID, tokenUsername) => {
  const pool = new Pool({ connectionString: process.env.DATABASE_STRING });
  const client = await pool.connect();
  client.on("error", (err) =>
    console.error("something bad has happened!", err.stack)
  );

  try {
    await client.query("BEGIN");
    const deleteResult = await client.query(
      `DELETE FROM post_tbl 
      WHERE post_id = $1 AND posted_user = $2
      RETURNING post_id`,
      [postID, tokenUsername]
    );
    await client.query("COMMIT");
    return deleteResult.rowCount > 0;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    await client?.release();
  }
};

const decrementPostCount = async (username) => {
  await pool.query(
    `UPDATE user_tbl 
    SET post_count = post_count - 1 
    WHERE username = $1`,
    [username]
  );
};

module.exports = DeletePost;
