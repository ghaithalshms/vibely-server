require("dotenv").config();
const checkToken = require("../../func/check_token");
const pool = require("../../pg_pool");

const GetUserPostFlow = async (req, res) => {
  const { username, token, lastGotPostID } = req.query;
  const client = await pool.connect().catch((err) => console.log(err));

  try {
    if (!lastGotPostID) {
      res.json("no post flow");
      return;
    }
    if (!token) {
      res.status(401).json("data missing");
      return;
    }

    const tokenUsername = await checkToken(token);
    if (tokenUsername === false) {
      if (!res.headersSent) res.status(401).json("wrong token");
      return;
    }

    const privacityQuery = await client.query(
      `SELECT privacity FROM user_tbl WHERE username=$1`,
      [username]
    );
    if (
      privacityQuery.rows[0].privacity === true &&
      username !== tokenUsername
    ) {
      const isFollowingQuery = await client.query(
        `SELECT * from follow_tbl WHERE follower=$1 AND following=$2`,
        [tokenUsername, username]
      );
      if (isFollowingQuery.rowCount === 0) {
        if (!res.headersSent) res.json("private account");
        return;
      }
    }

    const postIdInstructionString =
      lastGotPostID > 0 ? "AND p.post_id < $3" : "AND p.post_id > $3";

    const userPostFlowQuery = await client.query(
      `SELECT DISTINCT p.post_id, p.posted_user, p.description, p.file_type, p.like_count, p.comment_count, p.post_date,
pl.like_id, ps.saved_id
FROM post_tbl p
JOIN user_tbl u ON u.username = p.posted_user AND u.username=$1
LEFT JOIN post_like_tbl pl ON pl.liked_post = p.post_id AND pl.liked_user =$2
LEFT JOIN post_save_tbl ps ON ps.post_id = p.post_id AND ps.saved_user = $2
WHERE archived=false
${postIdInstructionString}
ORDER BY p.post_id desc
LIMIT 3`,
      [username, tokenUsername, lastGotPostID]
    );

    let postFlowArray = [];

    for (const post of userPostFlowQuery.rows) {
      postFlowArray.push({
        postID: post.post_id,
        username: post.posted_user,
        description: post.description,
        fileType: post.file_type,
        likeCount: post.like_count,
        commentCount: post.comment_count,
        postDate: post.post_date,
        isLiked: post.like_id > 0,
        isSaved: post.saved_id > 0,
      });
    }
    if (!res.headersSent)
      res.send({
        postFlowArray,
        lastGotPostID: postFlowArray[postFlowArray.length - 1]?.postID,
      });
  } catch (err) {
    console.log("unexpected error : ", err);
    res.status(500).json(err);
  } finally {
    client?.release();
  }
};

module.exports = GetUserPostFlow;
