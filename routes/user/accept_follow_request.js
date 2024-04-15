const checkToken = require("../../func/check_token");
const { Pool } = require("pg");

const AcceptFollowRequest = async (req, res) => {
  const { token, username } = req.body;
  const pool = new Pool({ connectionString: process.env.DATABASE_STRING });
  const client = await pool.connect().catch((err) => {
    console.log(err);
    res.status(500).json(err);
  });
  client.on("error", (err) =>
    console.error("something bad has happened!", err.stack)
  );

  try {
    if (!(token && username)) {
      res.status(400).json("data missing");
      return;
    }

    const tokenUsername = await checkToken(token);
    if (tokenUsername === false) {
      if (!res.headersSent) res.status(401).json("wrong token");
      return;
    }

    // DEFINITION OF FUNCTIONS
    const handleVerifyDeleteFollowRequest = async () => {
      await client.query(
        `DELETE FROM notification_tbl 
        WHERE noti_from = $1 
        AND noti_to = $2 
        AND noti_type='request'`,
        [username, tokenUsername]
      );
      return (userRequested = await client.query(
        `DELETE FROM follow_request_tbl 
      WHERE req_follower = $1
      AND req_following = $2
      RETURNING req_follower`,
        [username, tokenUsername]
      ));
    };

    const handleAcceptFollowRequest = async () => {
      await client.query(
        `INSERT INTO follow_tbl (follower, following, following_date) values ($1,$2,$3)`,
        [username, tokenUsername, new Date().toISOString()]
      );
      await client.query(
        `UPDATE user_tbl set following_count = following_count+1 WHERE username=$1`,
        [username]
      );
      await client.query(
        `UPDATE user_tbl set follower_count = follower_count+1 WHERE username=$1`,
        [tokenUsername]
      );
      await client.query(
        `INSERT INTO notification_tbl (noti_from, noti_to, noti_type, noti_date) values ($1,$2,$3,$4)`,
        [username, tokenUsername, "follow", new Date().toISOString()]
      );
      if (!res.headersSent) res.status(200).json("accepted");
    };

    if ((await handleVerifyDeleteFollowRequest()).rowCount > 0)
      handleAcceptFollowRequest();
    else if (!res.headersSent) res.status(200).json("no any request");
  } catch (err) {
    console.log("unexpected error : ", err);
    res.status(500).json(err);
  } finally {
    await client?.release();
  }
};

module.exports = AcceptFollowRequest;
