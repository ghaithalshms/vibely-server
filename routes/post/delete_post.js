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

    const pool = new Pool({ connectionString: process.env.DATABASE_STRING });
    const client = await pool.connect();
    client.on("error", (err) =>
      console.error("something bad has happened!", err.stack)
    );

    const filePath = await getFilePath(client, postID, tokenUsername);

    if (filePath?.startsWith("post")) {
      const isDeletedFromFirebase = await DeleteFileFromFirebase(filePath);

      if (!isDeletedFromFirebase) {
        return res.status(404).json("Post not found or unauthorized");
      }
    }

    const deleteResult = await deletePost(client, postID, tokenUsername);

    if (deleteResult) {
      await decrementPostCount(client, tokenUsername);
      return res.status(200).json("Post deleted");
    } else {
      return res.status(404).json("Post not found or unauthorized");
    }
  } catch (error) {
    console.error("Unexpected error:", error);
    return res.status(500).json("Internal server error");
  }
};

const getFilePath = async (client, postID, tokenUsername) => {
  const result = await client.query(
    `SELECT file_path FROM post_tbl WHERE post_id = $1 AND posted_user = $2`,
    [postID, tokenUsername]
  );
  return result.rows[0]?.file_path;
};

const deletePost = async (client, postID, tokenUsername) => {
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
  }
};

const decrementPostCount = async (client, username) => {
  await client.query(
    `UPDATE user_tbl 
    SET post_count = post_count - 1 
    WHERE username = $1`,
    [username]
  );
};

module.exports = DeletePost;
