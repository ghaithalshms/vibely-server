require("dotenv").config();
const { Client } = require("pg");
const jwt = require("jsonwebtoken");

// !!!!!!!!!!! USE await !!!!!!!!!!!!!!!!!!!!!!!!

async function checkToken(token) {
  const client = new Client({
    connectionString: process.env.DATABASE_STRING,
    connectionTimeoutMillis: 5000,
  });
  try {
    if (!token) return false;

    const decoded = {
      username: jwt.verify(token, process.env.JWT_SECRET_KEY).username,
      tokenVersion: jwt.verify(token, process.env.JWT_SECRET_KEY).tokenVersion,
    };

    await client.connect();

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
    if (client.connected) client.end().catch(() => {});
    console.error("unexpected error : ", err);
    return false;
  } finally {
    if (client.connected) client.end().catch(() => {});
  }
}

module.exports = checkToken;
