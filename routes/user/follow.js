const { Pool } = require("pg");
const checkToken = require("../../func/checkToken");

const Follow = async (req, res) => {
  const { token, username } = req.body;
  try {
    if (!(token && username)) {
      res.status(400).json("data missing");
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

    const followingResult = await pool.query(
      `SELECT * from follow_tbl WHERE follower=$1 AND following=$2`,
      [tokenUsername, username]
    );
    const followRequestResult = await pool.query(
      `SELECT * from follow_request_tbl WHERE req_follower=$1 AND req_following=$2`,
      [tokenUsername, username]
    );

    const privacityQuery = await pool.query(
      `SELECT privacity FROM user_tbl WHERE username=$1`,
      [username]
    );

    // DEFINITION OF FUNCTIONS
    const handleFollow = async () => {
      await pool.query(
        `INSERT INTO follow_tbl (follower, following, following_date) values ($1,$2,$3)`,
        [tokenUsername, username, new Date().toISOString()]
      );
      await pool.query(
        `UPDATE user_tbl set following_count = following_count+1 WHERE username=$1`,
        [tokenUsername]
      );
      await pool.query(
        `UPDATE user_tbl set follower_count = follower_count+1 WHERE username=$1`,
        [username]
      );
      await pool.query(
        `INSERT INTO notification_tbl (noti_from, noti_to, noti_type, noti_date) values ($1,$2,$3,$4)`,
        [tokenUsername, username, "follow", new Date().toISOString()]
      );
      if (!res.headersSent) res.status(200).json("followed");
    };

    const handleFollowRequest = async () => {
      await pool.query(
        `INSERT INTO follow_request_tbl (req_follower, req_following, req_date) values ($1,$2,$3)`,
        [tokenUsername, username, new Date().toISOString()]
      );
      await pool.query(
        `UPDATE user_tbl set request_count = request_count+1 WHERE username=$1`,
        [username]
      );
      await pool.query(
        `INSERT INTO notification_tbl (noti_from, noti_to, noti_type, noti_date) values ($1,$2,$3,$4)`,
        [tokenUsername, username, "request", new Date().toISOString()]
      );
      if (!res.headersSent) res.status(200).json("follow requested");
    };

    const handleUnfollow = async () => {
      await pool.query(
        `DELETE FROM follow_tbl WHERE follower=$1 AND following=$2`,
        [tokenUsername, username]
      );
      await pool.query(
        `UPDATE user_tbl set following_count = following_count-1 WHERE username=$1`,
        [tokenUsername]
      );
      await pool.query(
        `UPDATE user_tbl set follower_count = follower_count-1 WHERE username=$1`,
        [username]
      );
      await pool.query(
        `DELETE FROM notification_tbl WHERE noti_from = $1 AND noti_to = $2 AND noti_type=$3`,
        [tokenUsername, username, "follow"]
      );
      if (!res.headersSent) res.status(200).json("unfollowed");
    };

    const handleDeleteFollowRequest = async () => {
      await pool.query(
        `DELETE FROM follow_request_tbl WHERE req_follower=$1 AND req_following=$2`,
        [tokenUsername, username]
      );
      await pool.query(
        `UPDATE user_tbl set request_count = request_count-1 WHERE username=$1`,
        [username]
      );
      await pool.query(
        `DELETE FROM notification_tbl WHERE noti_from = $1 AND noti_to = $2 AND noti_type=$3`,
        [tokenUsername, username, "request"]
      );
      if (!res.headersSent) res.status(200).json("follow request deleted");
    };

    // START QUERY HERE

    // UNFOLLOW
    if (followingResult.rowCount > 0) {
      handleUnfollow();
      return;
    } else {
      // DELETE FOLLOW REQ
      if (followRequestResult.rows.length > 0) {
        handleDeleteFollowRequest();
        return;
      } else {
        // FOLLOW REQ
        if (
          privacityQuery.rowCount > 0 &&
          privacityQuery.rows[0].privacity === true
        ) {
          handleFollowRequest();
          return;
          // FOLLOW
        } else {
          handleFollow();
        }
      }
    }
  } catch (err) {
    if (!res.headersSent) res.status(500).json(err);
  }
};

module.exports = Follow;
