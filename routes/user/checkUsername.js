const { Pool } = require("pg");
const funcIsValidUsername = require("../../func/funcIsValidUsername");

const checkUsername = async (req, res) => {
  const { username } = req.body;
  try {
    if (!username) {
      res.status(400).json("data missing");
      return;
    }
    const pool = new Pool({
      connectionString: process.env.DATABASE_STRING,
      connectionTimeoutMillis: 5000,
    });
    if (!funcIsValidUsername(username)) {
      if (!res.headersSent)
        res.json("Only letters, numbers, and underscores are allowed.");
      return;
    }

    await pool
      .connect()
      .then()
      .catch(() => {
        if (!res.headersSent) res.status(502).json("DB connection error");
        return;
      });

    const result = await pool.query(
      `SELECT username FROM user_tbl WHERE username = $1`,
      [username]
    );
    if (result.rows.length === 0) {
      if (!res.headersSent) res.status(200).json("This username is available.");
    } else {
      if (!res.headersSent) res.json("This username is already taken.");
    }
  } catch (err) {
    if (!res.headersSent) res.status(500).json(err);
  }
};

module.exports = checkUsername;
