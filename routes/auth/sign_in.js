const { Client } = require("pg");
require("dotenv").config();
const jwt = require("jsonwebtoken");

const signIn = async (req, res) => {
  const { usernameOrEmail, password } = req.body;

  const client = new Client({
    connectionString: process.env.DATABASE_STRING,
    connectionTimeoutMillis: 30000,
  });
  client.on("error", (err) => {
    console.log("postgres erR:", err);
  });

  try {
    if (!(usernameOrEmail && password)) {
      res.status(400).json("data missing");
      return;
    }

    const usernameOrEmailVerified = usernameOrEmail.toLowerCase().trim();

    await client.connect();

    if (usernameOrEmailVerified && password) {
      const tokenResult = await client.query(
        `SELECT username, password, token_version FROM user_tbl 
        WHERE username = $1 OR email = $1`,
        [usernameOrEmailVerified]
      );

      if (tokenResult.rows.length > 0) {
        if (tokenResult.rows[0].password === password) {
          const token = jwt.sign(
            {
              username: tokenResult.rows[0].username,
              tokenVersion: tokenResult.rows[0].token_version,
            },
            process.env.JWT_SECRET_KEY,
            {
              expiresIn: "1000d",
            }
          );

          res
            .status(200)
            .json({ token, username: tokenResult.rows[0].username });
        } else {
          if (!res.headersSent)
            res.status(401).json("Password is not correct!");
        }
      } else {
        if (!res.headersSent) res.status(404).json("User not exist!");
      }
    } else {
      if (!res.headersSent) res.status(404).json(`Empty input`);
    }
  } catch (err) {
    if (client?.connected) client.end().catch(() => {});
    console.error("unexpected error : ", err);
    res.status(500).json(err);
  } finally {
    if (client?.connected) client.end().catch(() => {});
  }
};

module.exports = signIn;
