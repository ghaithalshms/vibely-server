const checkToken = require("../../func/check_token");
const { Client } = require("pg");

const UnarchivePost = async (req, res) => {
  const { token, postID } = req.body;

  const client = new Client({
    connectionString: process.env.DATABASE_STRING,
  });
  await client.connect();
  try {
    if (!(token && postID)) {
      return res.status(400).json("Data missing");
    }

    const tokenUsername = await validateToken(token);

    if (!tokenUsername) {
      return res.status(401).json("Wrong token");
    }

    const unarchiveResult = await unarchivePost(client, postID, tokenUsername);

    if (unarchiveResult.rowCount > 0) {
      await incrementPostCount(client, tokenUsername);
      return res.status(200).json("Post unarchived");
    } else {
      return res.status(404).json("Post not found or unauthorized");
    }
  } catch (error) {
    console.error("Unexpected error:", error);
    return res.status(500).json("Internal server error");
  } finally {
    client?.end();
  }
};

const validateToken = async (token) => {
  return await checkToken(token);
};

const unarchivePost = async (client, postID, tokenUsername) => {
  return await client.query(
    `UPDATE post_tbl 
    SET archived = false 
    WHERE post_id = $1 AND posted_user = $2
    RETURNING post_id`,
    [postID, tokenUsername]
  );
};

const incrementPostCount = async (client, username) => {
  await client.query(
    `UPDATE user_tbl 
    SET post_count = post_count + 1 
    WHERE username = $1`,
    [username]
  );
};

module.exports = UnarchivePost;
