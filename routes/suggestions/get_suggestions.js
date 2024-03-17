const checkToken = require("../../func/check_token");
const pool = require("../../pg_pool");
require("dotenv").config();

const GetSuggestions = async (req, res, connectedUsers) => {
  const { token } = req.query;
  const client = await pool.connect().catch((err) => console.log(err));

  try {
    if (!token) {
      res.status(401).json("data missing");
      return;
    }
    const tokenUsername = await checkToken(token);
    if (tokenUsername === false) {
      if (!res.headersSent) res.status(401).json("wrong token");
      return;
    }

    let suggestionUsersList = [];

    await client
      .query(
        `SELECT u.username, u.first_name, u.last_name, u.admin, u.verified
        FROM user_tbl u
        WHERE u.username IN (
            SELECT following 
            FROM follow_tbl 
            WHERE follower IN (
                SELECT following 
                FROM follow_tbl 
                WHERE follower = $1
            )
        ) 
		AND u.username NOT IN (
			SELECT following 
			FROM follow_tbl 
			WHERE follower = $1
		)
		AND u.username NOT IN (
			SELECT req_following 
			FROM follow_request_tbl 
			WHERE req_follower = $1
		)
		AND u.username != $1
    ORDER BY last_seen DESC
    LIMIT 6`,
        [tokenUsername]
      )
      .then((data) => (suggestionUsersList = data.rows))
      .catch((err) => console.log("suggestionUsersList eRR : ", err));
    if (suggestionUsersList.length < 6)
      await client
        .query(
          `SELECT u.username, u.first_name, u.last_name, u.admin, u.verified
        FROM user_tbl u
        WHERE u.username NOT IN (
            SELECT following 
            FROM follow_tbl 
            WHERE follower IN (
                SELECT following 
                FROM follow_tbl 
                WHERE follower = $1
            )
        ) 
		AND u.username NOT IN (
			SELECT following 
			FROM follow_tbl 
			WHERE follower = $1
		)
		AND u.username NOT IN (
			SELECT req_following 
			FROM follow_request_tbl 
			WHERE req_follower = $1
		)
		AND u.username != $1
    ORDER BY last_seen DESC
    LIMIT $2`,
          [tokenUsername, 6 - suggestionUsersList.length]
        )
        .then(
          (data) =>
            (suggestionUsersList = [...suggestionUsersList, ...data.rows])
        )
        .catch((err) => console.log("suggestionUsersList eRR : ", err));

    let suggestionUsersListToSend = [];

    for (const suggestionUser of suggestionUsersList) {
      suggestionUsersListToSend.push({
        username: suggestionUser.username ?? "",
        firstName: suggestionUser.first_name ?? "",
        lastName: suggestionUser.last_name ?? "",
        isVerified: suggestionUser.verified ?? false,
        isAdmin: suggestionUser.admin ?? false,
      });
    }

    if (!res.headersSent) res.send(suggestionUsersListToSend);
  } catch (error) {
    if (!res.headersSent) res.status(400).json(error.message);
  } finally {
    client?.release();
  }
};

module.exports = GetSuggestions;
