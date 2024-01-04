const { Pool } = require("pg");
require("dotenv").config();
const checkToken = require("../../func/check_token");

const GetUserPostFlow = async (req, res) => {
  const { username, token, lastGotPostID } = req.query;
  try {
    if (!lastGotPostID) {
      res.json("no post flow");
      return;
    }
    if (!token) {
      res.status(401).json("data missing");
      return;
    }
    const pool = new Pool({
      connectionString: process.env.DATABASE_STRING,
      connectionTimeoutMillis: 5000,
    });
    const tokenUsername = await checkToken(token);
    if (tokenUsername === false) {
      if (!res.headersSent) res.status(401).json("wrong token");
      return;
    }
    await pool
      .connect()
      .then()
      .catch(() => {
        if (!res.headersSent) res.status(502).json("DB connection error");
        return;
      });

    const privacityQuery = await pool.query(
      `SELECT privacity FROM user_tbl WHERE username=$1`,
      [username]
    );
    if (
      privacityQuery.rows[0].privacity === true &&
      username !== tokenUsername
    ) {
      const isFollowingQuery = await pool.query(
        `SELECT * from follow_tbl WHERE follower=$1 AND following=$2`,
        [tokenUsername, username]
      );
      if (isFollowingQuery.rowCount === 0) {
        if (!res.headersSent) res.json("private account");
        return;
      }
    }

    const postIdInstructionString =
      lastGotPostID > 0 ? "AND post_id < $2" : "AND post_id > $2";

    const userPostFlowQuery = await pool.query(
      `SELECT post_id, posted_user, description, file, file_type, like_count, comment_count, post_date
      FROM post_tbl 
      WHERE posted_user = $1
      AND archived = 'false'
      ${postIdInstructionString}
      ORDER BY post_id DESC
      LIMIT 5`,
      [username, lastGotPostID]
    );

    const handleIsPostLiked = async (postID) => {
      const result = await pool.query(
        `SELECT DISTINCT liked_user FROM post_like_tbl 
      WHERE liked_user = $1 AND liked_post = $2`,
        [tokenUsername, postID]
      );
      return result.rowCount > 0;
    };

    const handleIsPostSaved = async (postID) => {
      const result = await pool.query(
        `SELECT DISTINCT saved_user FROM post_save_tbl 
      WHERE saved_user = $1 AND post_id = $2`,
        [tokenUsername, postID]
      );
      return result.rowCount > 0;
    };

    let postFlowArray = [];

    for (const post of userPostFlowQuery.rows) {
      const isLiked = await handleIsPostLiked(post.post_id);
      const isSaved = await handleIsPostSaved(post.post_id);
      postFlowArray.push({
        postID: post.post_id,
        postedUser: post.posted_user,
        description: post.description,
        file: post.file,
        fileType: post.file_type,
        likeCount: post.like_count,
        commentCount: post.comment_count,
        postDate: post.post_date,
        isLiked,
        isSaved,
      });
    }
    if (!res.headersSent)
      res.send({
        postFlowArray,
        lastGotPostID: postFlowArray[postFlowArray.length - 1]?.postID,
      });
  } catch (error) {
    if (!res.headersSent) res.status(400).json(error.message);
  }
};

module.exports = GetUserPostFlow;
