const checkToken = require("../../func/check_token");
const { Client } = require("pg");
require("dotenv").config();

const fetchSuggestionUsers = async (client, tokenUsername) => {
  const query = `
    SELECT u.username, u.first_name, u.last_name, u.admin, u.verified
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
    LIMIT 6`;

  const { rows } = await client.query(query, [tokenUsername]);
  return rows;
};

const GetSuggestions = async (req, res) => {
  const { token } = req.query;
  const client = new Client({ connectionString: process.env.DATABASE_STRING });
  await client.connect();

  try {
    if (!token) {
      res.status(401).json("data missing");
      return;
    }

    const tokenUsername = await checkToken(token);
    if (tokenUsername === false) {
      res.status(401).json("wrong token");
      return;
    }

    let suggestionUsersList = await fetchSuggestionUsers(client, tokenUsername);

    if (suggestionUsersList.length < 6) {
      const remainingLimit = 6 - suggestionUsersList.length;
      const additionalUsers = await fetchAdditionalUsers(
        client,
        tokenUsername,
        remainingLimit
      );
      suggestionUsersList = [...suggestionUsersList, ...additionalUsers];
    }

    const suggestionUsersListToSend = suggestionUsersList.map(
      (suggestionUser) => ({
        username: suggestionUser.username,
        firstName: suggestionUser.first_name ?? "",
        lastName: suggestionUser.last_name ?? "",
        isVerified: suggestionUser.verified ?? false,
        isAdmin: suggestionUser.admin ?? false,
      })
    );

    if (!res.headersSent) {
      res.send(suggestionUsersListToSend);
    }
  } catch (error) {
    if (!res.headersSent) {
      res.status(400).json(error.message);
    }
  } finally {
    client?.end();
  }
};

const fetchAdditionalUsers = async (client, tokenUsername, limit) => {
  const query = `
    SELECT u.username, u.first_name, u.last_name, u.admin, u.verified
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
    LIMIT $2`;

  const { rows } = await client.query(query, [tokenUsername, limit]);
  return rows;
};

module.exports = GetSuggestions;
