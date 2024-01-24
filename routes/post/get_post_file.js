require("dotenv").config();
const CheckTokenNoDB = require("../../func/check_token_no_db");
const _pool = require("../../pg_pool");

const GetPostFile = async (req, res) => {
  const { token, postID } = req.query;

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

    const fileQuery = await _pool.query(
      `SELECT DISTINCT file, file_type 
FROM post_tbl , user_tbl, follow_tbl
WHERE (
	(follower=$1 AND posted_user = following)
	   OR (privacity = false AND username = posted_user)
	   OR posted_user=$1
)
AND post_id = $2
`,
      [tokenUsername, postID]
    );

    if (!res.headersSent) res.send(fileQuery?.rows[0]);
  } catch (err) {
    console.log("unexpected error : ", err);
    res.status(500).json(err);
  }
};

module.exports = GetPostFile;
