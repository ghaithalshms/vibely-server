const checkToken = require("../../func/check_token");
const { Client } = require("pg");

const handleSavePost = async (req, res) => {
  const { token, postID } = req.body;
  const client = new Client({ connectionString: process.env.DATABASE_STRING });
  await client.connect();

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

    const postSaved = await isPostSaved(tokenUsername, postID, client);
    if (postSaved) {
      await handleUnsave(postID, tokenUsername, client);
      if (!res.headersSent) res.status(200).json("unsaved");
    } else {
      await handleSave(postID, tokenUsername, client);
      if (!res.headersSent) res.status(200).json("saved");
    }
  } catch (err) {
    console.log("unexpected error : ", err);
    res.status(500).json(err);
  } finally {
    client?.end();
  }
};

const isPostSaved = async (tokenUsername, postID, client) => {
  const isSavedQuery = await client.query(
    `SELECT DISTINCT post_id from post_save_tbl WHERE saved_user=$1 AND post_id=$2`,
    [tokenUsername, postID]
  );
  return isSavedQuery.rowCount > 0;
};

const handleSave = async (postID, tokenUsername, client) => {
  await client.query(
    `INSERT INTO post_save_tbl (post_id, saved_user, saved_date) values ($1,$2,$3)`,
    [postID, tokenUsername, new Date().toISOString()]
  );
  await client.query(
    `UPDATE post_tbl set save_count = save_count+1 WHERE post_id=$1`,
    [postID]
  );
};

const handleUnsave = async (postID, tokenUsername, client) => {
  await client.query(
    `DELETE FROM post_save_tbl WHERE post_id=$1 AND saved_user=$2`,
    [postID, tokenUsername]
  );
  await client.query(
    `UPDATE post_tbl set save_count = save_count-1 WHERE post_id=$1`,
    [postID]
  );
};

module.exports = handleSavePost;
