require("dotenv").config();
const { Pool } = require("pg");
const jwt = require("jsonwebtoken");

// !!!!!!!!!!! USE await !!!!!!!!!!!!!!!!!!!!!!!!

async function checkToken(token) {
  if (!token) return false;
  const pool = new Pool({ connectionString: process.env.DATABASE_STRING });
  try {
    await pool.connect();
    const decoded = {
      username: jwt.verify(token, process.env.JWT_SECRET_KEY).username,
      tokenVersion: jwt.verify(token, process.env.JWT_SECRET_KEY).tokenVersion,
    };

    const currentTokenVersionQuery = await pool.query(
      `SELECT token_version FROM user_tbl WHERE username=$1`,
      [decoded.username]
    );

    if (decoded.tokenVersion == currentTokenVersionQuery.rows[0].token_version)
      return decoded.username;
    else return false;
  } catch (error) {
    return false;
  }
}

module.exports = checkToken;
