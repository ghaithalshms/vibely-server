require("dotenv").config();
const pool = require("../../pg_pool");

const GetSearchUser = async (req, res) => {
  const { username } = req.query;
  const client = await pool.connect().catch((err) => console.log(err));

  try {
    if (!username) {
      res.status(400).json("data missing");
      return;
    }

    const userListQuery = await client.query(
      `SELECT DISTINCT username, first_name,last_name, admin, verified
      FROM user_tbl 
      WHERE username ILIKE $1
      OR first_name ILIKE $1
      OR last_name ILIKE $1
      LIMIT 5
      `,
      [username + "%"]
    );

    let userList = [];

    for (const user of userListQuery.rows) {
      userList.push({
        username: user.username ?? "",
        firstName: user.first_name ?? "",
        lastName: user.last_name ?? "",
        isVerified: user.verified ?? false,
        isAdmin: user.admin ?? false,
      });
    }
    if (!res.headersSent) res.send(userList);
  } catch (err) {
    console.log("unexpected error : ", err);
    res.status(500).json(err);
  } finally {
    client?.release();
  }
};

module.exports = GetSearchUser;
