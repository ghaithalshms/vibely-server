const checkToken = require("../../func/check_token");
const pool = require("../../pg_pool");

const DeletePost = async (req, res) => {
  const { token, postID } = req.body;

  try {
    const client = await pool.connect().catch((err) => console.log(err));

    if (!(token && postID)) {
      return res.status(400).json("Data missing");
    }

    const tokenUsername = await validateToken(token);

    if (!tokenUsername) {
      return res.status(401).json("Wrong token");
    }

    const deleteResult = await deletePost(client, postID, tokenUsername);

    if (deleteResult.rowCount > 0) {
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

const validateToken = async (token) => {
  return await checkToken(token);
};

const deletePost = async (client, postID, tokenUsername) => {
  return await client.query(
    `DELETE FROM post_tbl 
    WHERE post_id = $1 AND posted_user = $2
    RETURNING post_id`,
    [postID, tokenUsername]
  );
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
