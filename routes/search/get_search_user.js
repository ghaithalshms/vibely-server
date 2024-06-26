require("dotenv").config();
const { Pool } = require("pg");

const GetSearchUser = async (req, res) => {
  const { username } = req.query;
  const pool = new Pool({ connectionString: process.env.DATABASE_STRING });
  const client = await pool.connect().catch((err) => {
    console.log(err);
    res.status(500).json(err);
  });
  client.on("error", (err) =>
    console.error("something bad has happened!", err.stack)
  );

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
    await client?.release();
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
