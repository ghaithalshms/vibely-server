require("dotenv").config();

const jwt = require("jsonwebtoken");
const { Client } = require("pg");

// !!!!!!!!!!! USE await !!!!!!!!!!!!!!!!!!!!!!!!

async function checkToken(token) {
  const client = new Client({ connectionString: process.env.DATABASE_STRING });
  await client.connect();

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
    await client?.end();
  }
}

module.exports = checkToken;
