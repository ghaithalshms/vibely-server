require("dotenv").config();
const checkToken = require("../../func/check_token");
const _pool = require("../../pg_pool");

const GetExplorerPostFlow = async (req, res) => {
  const { token, lastGotPostID } = req.query;

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
      lastGotPostID > 0 ? "AND p.post_id < $2" : "AND p.post_id > $2";

    const homePostFlowQuery = await _pool.query(
      `SELECT DISTINCT p.post_id, p.description, p.file_type, p.like_count, p.comment_count, p.post_date,
u.username, u.first_name, u.admin, u.verified,
pl.like_id, ps.saved_id
FROM post_tbl p
JOIN user_tbl u ON u.username = p.posted_user
AND u.username NOT IN (
	SELECT following 
	FROM follow_tbl 
	WHERE follower = $1
)
AND u.username!=$1
AND u.privacity=false
LEFT JOIN post_like_tbl pl ON pl.liked_post = p.post_id AND pl.liked_user =$1
LEFT JOIN post_save_tbl ps ON ps.post_id = p.post_id AND ps.saved_user = $1
WHERE archived=false
${postIdInstructionString}
ORDER BY p.post_id desc
LIMIT 5`,
      [tokenUsername, lastGotPostID]
    );

    let postFlowArray = [];

    for (const post of homePostFlowQuery.rows) {
      postFlowArray.push({
        post: {
          postID: post.post_id,
          description: post.description,
          file: null,
          fileType: post.file_type,
          likeCount: post.like_count,
          commentCount: post.comment_count,
          postDate: post.post_date,
          isLiked: post.like_id > 0,
          isSaved: post.saved_id > 0,
        },
        user: {
          username: post.username,
          firstName: post.first_name,
          picture: null,
          postCount: post.post_count,
          isAdmin: post.admin,
          isVerified: post.verified,
        },
      });
    }
    if (!res.headersSent)
      res.send({
        postFlowArray,
        lastGotPostID: postFlowArray[postFlowArray.length - 1]?.post?.postID,
      });
  } catch (err) {
    console.log("unexpected error : ", err);
    res.status(500).json(err);
  }
};

module.exports = GetExplorerPostFlow;
