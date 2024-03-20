const pool = require("../../pg_pool");
require("dotenv").config();
const jwt = require("jsonwebtoken");

async function handleCheckToken(token) {
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

const ResetPassword = async (req, res) => {
  const { password, token } = req.body;
  const client = await pool.connect().catch((err) => console.log(err));

  try {
    if (!(password && token)) {
      res.status(400).json("data missing");
      return;
    }

    const tokenUsername = await handleCheckToken(token);
    if (tokenUsername === false) {
      if (!res.headersSent) res.json("wrong token");
      return;
    }

    await client.query(
      `UPDATE user_tbl SET password = $2, token_version = token_version+1
    WHERE username = $1`,
      [tokenUsername, password]
    );

    if (!res.headersSent) res.send("Password changed successfully");
  } catch (err) {
    console.error("unexpected error : ", err);
    res.status(500).json(err);
  } finally {
    client?.release();
  }
};

module.exports = ResetPassword;
