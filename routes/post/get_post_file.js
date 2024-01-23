const { Client } = require("pg");
require("dotenv").config();
const CheckTokenNoDB = require("../../func/check_token_no_db");

const GetPostFile = async (req, res) => {
  const { token, postID } = req.query;
  const client = new Client({
    connectionString: process.env.DATABASE_STRING,
    connectionTimeoutMillis: 5000,
  });
  try {
    if (!(token && postID)) {
      res.status(400).json("data missing");
      return;
    }

    const tokenUsername = await CheckTokenNoDB(token);
    if (tokenUsername === false) {
      if (!res.headersSent) res.status(401).json("wrong token");
      return;
    }

    await client.connect();

    const fileQuery = await client.query(
      `SELECT DISTINCT file, file_type 
FROM post_tbl , user_tbl, follow_tbl
WHERE ((username = follower AND posted_user = following) 
OR (privacity = false AND username = posted_user)
OR posted_user=$2)
AND post_id = $1
AND username=$2`,
      [postID, tokenUsername]
    );

    if (!res.headersSent) res.send(fileQuery?.rows[0]);
  } catch (err) {
    if (client?.connected) client.end().catch(() => {});
    console.error("unexpected error : ", err);
    res.status(500).json(err);
  } finally {
    if (client?.connected) client.end().catch(() => {});
  }
};

module.exports = GetPostFile;
