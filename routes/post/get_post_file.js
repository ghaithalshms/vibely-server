require("dotenv").config();
const checkToken = require("../../func/check_token");
const pool = require("../../pg_pool");

const GetPostFile = async (req, res) => {
  const { token, postID } = req.query;
  const client = await pool.connect().catch((err) => console.log(err));

  try {
    if (!(token && postID)) {
      res.status(400).json("data missing");
      return;
    }

    const tokenUsername = await checkToken(token);
    if (tokenUsername === false) {
      if (!res.headersSent) res.status(401).json("wrong token");
      return;
    }

    const fileQuery = await client.query(
      `SELECT file, file_type, posted_user
      FROM post_tbl, user_tbl, follow_tbl
      WHERE (
      	(follower=$1 AND posted_user = following)
      	   OR (privacity = false AND username = posted_user)
      	   OR posted_user=$1
      )
      AND post_id = $2`,
      [tokenUsername, postID]
    );

    const file = fileQuery.rows[0].file;
    const fileType = fileQuery.rows[0].file_type;
    const postedUser = fileQuery.rows[0].posted_user;

    if (tokenUsername !== postedUser)
      await client.query(
        `UPDATE post_tbl set view_count = view_count + 1 WHERE post_id = $1`,
        [postID]
      );

    if (!res.headersSent) {
      res.setHeader("Content-Type", fileType);
      res.send(file);
    }
  } catch (err) {
    console.log("unexpected error : ", err);
    res.status(500).json(err);
  } finally {
    client?.release();
  }
};

module.exports = GetPostFile;
