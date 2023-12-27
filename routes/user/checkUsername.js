const { Pool } = require("pg");
const funcIsValidUsername = require("../../func/funcIsValidUsername");

const checkUsername = async (req, res) => {
  const pool = new Pool({ connectionString: process.env.DATABASE_STRING });
  try {
    const { username } = req.body;
    if (!funcIsValidUsername(username)) {
      res.json("Only letters, numbers, and underscores are allowed.");
      return;
    }

    await pool
      .connect()
      .then()
      .catch(() => res.status(502).json("DB connection error"));

    const result = await pool.query(
      `SELECT username FROM user_tbl WHERE username = $1`,
      [username]
    );
    if (result.rows.length === 0)
      res.status(200).json("This username is available.");
    else res.json("This username is already taken.");
  } catch (err) {
    console.error("unexpected error : ", err);
    res.status(500).json(err);
  }
};

module.exports = checkUsername;
