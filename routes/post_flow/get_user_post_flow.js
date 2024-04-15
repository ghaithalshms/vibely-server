require("dotenv").config();
const checkToken = require("../../func/check_token");
const { Pool } = require("pg");

const handleUserPostFlow = async (req, res) => {
  const { username, token, lastGotPostID } = req.query;

  if (!lastGotPostID) {
    res.json({ postFlowArray: [] });
    return;
  }

  if (!(token && username)) {
    res.status(401).json("data missing");
    return;
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_STRING });
  const client = await pool.connect().catch((err) => {
    console.log(err);
    res.status(500).json(err);
  });
  client.on("error", (err) =>
    console.error("something bad has happened!", err.stack)
  );

  try {
    const tokenUsername = await checkToken(token);
    if (tokenUsername === false) {
      if (!res.headersSent) res.status(401).json("wrong token");
      return;
    }

    const userPrivacy = await fetchUserPrivacy(username, client);
    if (userPrivacy && username !== tokenUsername) {
      const isFollowing = await checkFollowing(tokenUsername, username, client);
      if (!isFollowing) {
        if (!res.headersSent) res.json("private account");
        return;
      }
    }

    const userPostFlow = await fetchUserPostFlow(
      username,
      tokenUsername,
      lastGotPostID,
      client
    );

    const postFlowArray = userPostFlow.map(formatPostData);

    if (!res.headersSent)
      res.send({
        postFlowArray,
        lastGotPostID: postFlowArray[postFlowArray.length - 1]?.postID,
      });
  } catch (err) {
    console.log("unexpected error : ", err);
    res.status(500).json(err);
  } finally {
    await client?.release();
  }
};

const fetchUserPrivacy = async (username, client) => {
  const privacityQuery = await client.query(
    `SELECT privacity FROM user_tbl WHERE username=$1`,
    [username]
  );
  return privacityQuery.rows[0].privacity;
};

const checkFollowing = async (follower, following, client) => {
  const isFollowingQuery = await client.query(
    `SELECT * from follow_tbl WHERE follower=$1 AND following=$2`,
    [follower, following]
  );
  return isFollowingQuery.rowCount > 0;
};

const fetchUserPostFlow = async (
  username,
  tokenUsername,
  lastGotPostID,
  client
) => {
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

  return userPostFlowQuery.rows;
};

const formatPostData = (post) => ({
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

module.exports = handleUserPostFlow;
