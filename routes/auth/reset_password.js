const { Client } = require("pg");
require("dotenv").config();
const jwt = require("jsonwebtoken");

async function verifyTokenAndGetUsername(token) {
  try {
    if (!token) return false;
    const username = jwt.verify(
      token,
      process.env.JWT_SECRET_KEY
    ).resetPasswordUsername;
    return username;
  } catch (error) {
    return false;
  }
}

async function updateUserPassword(client, tokenUsername, newPassword) {
  await client.query(
    `UPDATE user_tbl SET password = $2, token_version = token_version + 1
    WHERE username = $1`,
    [tokenUsername, newPassword]
  );
}

const ResetPassword = async (req, res) => {
  const { password, token } = req.body;
  const client = new Client({ connectionString: process.env.DATABASE_STRING });
  client.on("error", (err) =>
    console.error("something bad has happened!", err.stack)
  );
  await client.connect();

  try {
    if (!(password && token)) {
      res.status(400).json("data missing");
      return;
    }

    const tokenUsername = await verifyTokenAndGetUsername(token);
    if (tokenUsername === false) {
      if (!res.headersSent) res.json("wrong token");
      return;
    }

    await updateUserPassword(client, tokenUsername, password);

    if (!res.headersSent) res.send("Password changed successfully");
  } catch (err) {
    console.error("unexpected error : ", err);
    res.status(500).json(err);
  } finally {
    await client?.end();
  }
};

module.exports = ResetPassword;
