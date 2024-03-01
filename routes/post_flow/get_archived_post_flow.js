require("dotenv").config();
const checkToken = require("../../func/check_token");
const pool = require("../../pg_pool");

const GetArchivedPostFlow = async (req, res) => {
  const { token, lastGotPostID } = req.query;
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

    const postIdInstructionString =
      lastGotPostID > 0 ? "AND post_id < $2" : "AND post_id > $2";

    const likedPostFlowQuery = await client.query(
      `SELECT DISTINCT post_id, description, file, file_type, like_count, comment_count, post_date,
      username, first_name, post_count, user_tbl.picture as user_picture, admin, verified
      FROM post_tbl, user_tbl
      WHERE posted_user = $1
      AND username = posted_user
      AND archived = 'true'
      ${postIdInstructionString}
      ORDER BY post_id DESC
      LIMIT 4`,
      [tokenUsername, lastGotPostID]
    );

    const handleIsPostLiked = async (postID) => {
      const result = await client.query(
        `SELECT DISTINCT liked_user FROM post_like_tbl
      WHERE liked_user = $1 AND liked_post = $2`,
        [tokenUsername, postID]
      );
      return result.rowCount > 0;
    };

    const handleIsPostSaved = async (postID) => {
      const result = await client.query(
        `SELECT DISTINCT saved_user FROM post_save_tbl
      WHERE saved_user = $1 AND post_id = $2`,
        [tokenUsername, postID]
      );
      return result.rowCount > 0;
    };

    let postFlowArray = [];

    for (const post of likedPostFlowQuery.rows) {
      const isLiked = await handleIsPostLiked(post.post_id);
      const isSaved = await handleIsPostSaved(post.post_id);
      postFlowArray.push({
        post: {
          postID: post.post_id,
          description: post.description,
          file: post.file,
          fileType: post.file_type,
          likeCount: post.like_count,
          commentCount: post.comment_count,
          postDate: post.post_date,
          isLiked,
          isSaved,
        },
        user: {
          username: post.username,
          firstName: post.first_name,
          picture: post.user_picture,
          postCount: post.post_count,
          isAdmin: post.admin,
          isVerified: post.verified,
        },
      });
    }
    if (!res.headersSent)
      res.send({
        postFlowArray,
        lastGotPostID: postFlowArray[postFlowArray.length - 1]?.post.postID,
      });
  } catch (err) {
    console.log("unexpected error : ", err);
    res.status(500).json(err);
  } finally {
    client?.release();
  }
};

module.exports = GetArchivedPostFlow;