const checkToken = require("../../func/check_token");
const pool = require("../../pg_pool");

const deleteComment = async (req, res) => {
  const client = await pool.connect().catch((err) => console.log(err)); // Create the client only once

  try {
    const { token, commentID } = req.body;
    if (!isValidData(token, commentID)) {
      return res.status(400).json("Data missing");
    }

    const tokenUsername = await validateToken(token);
    if (!tokenUsername) {
      return res.status(401).json("Wrong token");
    }

    const deleted = await deleteCommentFromDB(client, commentID, tokenUsername);
    if (deleted) {
      return res.status(200).json("Comment deleted");
    } else {
      return res.status(404).json("Comment not found or unauthorized");
    }
  } catch (error) {
    console.log("Error in deleteComment:", error);
    return res.status(500).json("Internal server error");
  } finally {
    client.release(); // Release the client connection in the finally block
  }
};

const isValidData = (token, commentID) => {
  return token && commentID;
};

const validateToken = async (token) => {
  return await checkToken(token);
};

const deleteCommentFromDB = async (client, commentID, tokenUsername) => {
  try {
    const result = await client.query(
      `DELETE FROM comment_tbl WHERE comment_id = $1 AND commented_user = $2 RETURNING *`,
      [commentID, tokenUsername]
    );
    if (result.rowCount === 1) {
      await decrementCommentCount(client, result.rows[0].post_id);
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.log("Error in deleteCommentFromDB:", error);
  }
};

const decrementCommentCount = async (client, postID) => {
  try {
    await client.query(
      `UPDATE post_tbl SET comment_count = comment_count - 1 WHERE post_id = $1`,
      [postID]
    );
  } catch (error) {
    console.log("Error in decrementCommentCount:", error);
  }
};

module.exports = deleteComment;
