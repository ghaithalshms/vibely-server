require("dotenv").config();
const { GetFileFromFireBase } = require("../../firebase/get_file.js");
const checkToken = require("../../func/check_token");
const { Pool } = require("pg");

const updatePostViewCount = async (client, tokenUsername, postID) => {
  await client.query(
    `UPDATE post_tbl SET view_count = view_count + 1 WHERE post_id = $1`,
    [postID]
  );
};

const getFileQuery = async (client, tokenUsername, postID) => {
  return await client.query(
    `SELECT file_path, posted_user
    FROM post_tbl, user_tbl, follow_tbl
    WHERE (
      (follower=$1 AND posted_user = following)
      OR (privacity = false AND username = posted_user)
      OR posted_user=$1
    )
    AND post_id = $2`,
    [tokenUsername, postID]
  );
};

const GetPostFile = async (req, res) => {
  const { token, postID } = req.query;
  const pool = new Pool({ connectionString: process.env.DATABASE_STRING });
  const client = await pool.connect().catch((err) => {
    console.log(err);
    res.status(500).json(err);
  });
  client.on("error", (err) =>
    console.error("something bad has happened!", err.stack)
  );

  try {
    if (!(token && postID)) {
      res.status(400).json("data missing");
      return;
    }

    const tokenUsername = await checkToken(token);
    if (tokenUsername === false) {
      res.status(401).json("wrong token");
      return;
    }

    const fileQuery = await getFileQuery(client, tokenUsername, postID);

    if (fileQuery.rows.length === 0) {
      res.status(404).json("post not found");
      return;
    }

    const filePath = fileQuery.rows[0].file_path;
    const postedUser = fileQuery.rows[0].posted_user;

    if (tokenUsername !== postedUser) {
      await updatePostViewCount(client, tokenUsername, postID);
    }

    if (!res.headersSent) {
      const url = await GetFileFromFireBase(filePath);
      res.redirect(url);
    }
  } catch (err) {
    console.log("unexpected error:", err);
    res.status(500).json(err);
  } finally {
    await client?.release();
  }
};

module.exports = GetPostFile;
