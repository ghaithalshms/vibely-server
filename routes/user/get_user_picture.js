const { Client } = require("pg");
require("dotenv").config();

const GetUserPicture = async (req, res) => {
  const { username } = req.query;
  const client = new Client({
    connectionString: process.env.DATABASE_STRING,
    connectionTimeoutMillis: 5000,
  });
  try {
    if (!username) {
      res.status(400).json("data missing");
      return;
    }

    await client.connect();

    const pictureQuery = await client.query(
      "SELECT picture FROM user_tbl WHERE username = $1",
      [username]
    );

    if (!res.headersSent) res.send(pictureQuery.rows[0]);
  } catch (err) {
    if (client?.connected) client.end().catch(() => {});
    console.error("unexpected error : ", err);
    res.status(500).json(err);
  } finally {
    if (client?.connected) client.end().catch(() => {});
  }
};

module.exports = GetUserPicture;
