const { Pool } = require("pg");
require("dotenv").config();

const GetUserPicture = async (req, res) => {
  const { username } = req.query;
  try {
    if (!username) {
      res.status(404).json("data missing");
      return;
    }
    const pool = new Pool({
      connectionString: process.env.DATABASE_STRING,
      connectionTimeoutMillis: 5000,
    });

    await pool
      .connect()
      .then()
      .catch(() => {
        if (!res.headersSent) res.status(502).json("DB connection error");
        return;
      });

    const pictureQuery = await pool.query(
      "SELECT picture FROM user_tbl WHERE username = $1",
      [username]
    );

    if (!res.headersSent) res.send(pictureQuery.rows[0]);
  } catch (error) {
    if (!res.headersSent) res.status(400).json(error.message);
  }
};

module.exports = GetUserPicture;
