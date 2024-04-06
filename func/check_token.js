require("dotenv").config();

const jwt = require("jsonwebtoken");
const { Pool } = require("pg");

// !!!!!!!!!!! USE await !!!!!!!!!!!!!!!!!!!!!!!!

async function checkToken(token) {
  const pool = new Pool({ connectionString: process.env.DATABASE_STRING });
  const client = await pool.connect();
  client.on("error", (err) =>
    console.error("something bad has happened!", err.stack)
  );

  try {
    if (!token) return false;

    const decoded = {
      username: jwt.verify(token, process.env.JWT_SECRET_KEY).username,
      tokenVersion: jwt.verify(token, process.env.JWT_SECRET_KEY).tokenVersion,
    };

    const currentTokenVersionQuery = await client.query(
      `SELECT token_version FROM user_tbl WHERE username=$1`,
      [decoded.username]
    );

    if (
      decoded.tokenVersion == currentTokenVersionQuery?.rows[0]?.token_version
    )
      return decoded.username;
    else return false;
  } catch (err) {
    return false;
  } finally {
    await client?.release();
  }
}

module.exports = checkToken;
