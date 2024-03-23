require("dotenv").config();
const pool = require("../../pg_pool");

const GetSearchUser = async (req, res) => {
  const { username } = req.query;
  const client = await pool.connect().catch((err) => console.log(err));

  try {
    if (!username) {
      return res.status(400).json("Data missing");
    }

    const userList = await searchUsers(client, username);

    return res.send(userList);
  } catch (error) {
    console.error("Unexpected error:", error);
    return res.status(500).json(error);
  } finally {
    client.release();
  }
};

const searchUsers = async (client, username) => {
  const userListQuery = await client.query(
    `SELECT DISTINCT username, first_name, last_name, admin, verified
    FROM user_tbl 
    WHERE username ILIKE $1
    OR first_name ILIKE $1
    OR last_name ILIKE $1
    LIMIT 5`,
    [username + "%"]
  );

  return userListQuery.rows.map((user) => ({
    username: user.username ?? "",
    firstName: user.first_name ?? "",
    lastName: user.last_name ?? "",
    isVerified: user.verified ?? false,
    isAdmin: user.admin ?? false,
  }));
};

module.exports = GetSearchUser;
