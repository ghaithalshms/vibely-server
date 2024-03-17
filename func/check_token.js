require("dotenv").config();

const jwt = require("jsonwebtoken");
const pool = require("../pg_pool");

// !!!!!!!!!!! USE await !!!!!!!!!!!!!!!!!!!!!!!!

async function checkToken(token) {
  const client = await pool.connect().catch((err) => console.log(err));

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
    client?.release();
  }
}

module.exports = checkToken;
