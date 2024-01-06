const { Client } = require("pg");
const funcIsValidUsername = require("../../func/is_valid_username");

const checkUsername = async (req, res) => {
  const { username } = req.body;
  const client = new Client({
    connectionString: process.env.DATABASE_STRING,
    connectionTimeoutMillis: 5000,
  });
  try {
    if (!username) {
      res.status(400).json("data missing");
      return;
    }

    if (!funcIsValidUsername(username)) {
      if (!res.headersSent)
        res.json("Only letters, numbers, and underscores are allowed.");
      return;
    }

    await client.connect();

    const result = await client.query(
      `SELECT username FROM user_tbl WHERE username = $1`,
      [username]
    );
    if (result.rows.length === 0) {
      if (!res.headersSent) res.status(200).json("This username is available.");
    } else {
      if (!res.headersSent) res.json("This username is already taken.");
    }
  } catch (err) {
    if (client.connected) client.end().catch(() => {});
    console.error("unexpected error : ", err);
    res.status(500).json(err);
  } finally {
    if (client.connected) client.end().catch(() => {});
  }
};

module.exports = checkUsername;
